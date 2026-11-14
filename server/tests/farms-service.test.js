const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const { resolve } = require('node:path');
function service(repository) {
  const module = {exports:{}};
  vm.runInNewContext(readFileSync(resolve(__dirname,'../src/modules/farms/farms.service.js'),'utf8'),{
    module, exports: module.exports, require: () => repository,
  });
  return module.exports;
}

test('missing RPC reports an actionable setup error rather than a generic failure', async () => {
  const api=service({findOpeningState:async()=>({as_of_date:'2026-09-01'}),createTransaction:async()=>{throw {code:'PGRST202',message:'Function missing'};}});
  await assert.rejects(api.addTransaction({date:'2026-09-02',particular:'Sale',type:'credit',amount:10,userId:'user'}),e=>e.statusCode===503 && e.message.includes('database/farms.sql'));
});

test('concurrent opening conflict is mapped to HTTP 409', async () => {
  const api=service({findOpeningState:async()=>null,createOpeningState:async()=>{throw {code:'23505'};}});
  await assert.rejects(api.setupOpeningState({asOfDate:'2026-09-01',balance:10,userId:'user'}),e=>e.statusCode===409);
});

test('invalid dates and sub-cent amounts never reach transaction insertion', async () => {
  let writes=0;
  const api=service({findOpeningState:async()=>({as_of_date:'2026-09-01'}),createTransaction:async()=>{writes++;}});
  for (const patch of [{date:'2026-02-30'},{date:'2026-08-31'},{amount:0.001},{amount:Infinity},{type:'sale'}]) {
    await assert.rejects(api.addTransaction({date:'2026-09-02',particular:'Sale',type:'credit',amount:10,...patch}),e=>e.statusCode===400);
  }
  assert.equal(writes,0);
});
