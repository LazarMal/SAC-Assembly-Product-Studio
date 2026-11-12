import test from 'node:test';
import assert from 'node:assert/strict';
import {createRoller,spec,rollState} from './src/model.js';
test('Unrolled and wound cloth conserve the material cross section',()=>{
 for(const d of [0,.2,.5,.9,1]){const {length,radius}=rollState(d);assert.ok(Math.abs(length*spec.clothThickness+Math.PI*(radius**2-spec.tubeRadius**2)-(spec.minimumWrap+spec.travel)*spec.clothThickness)<1e-7)}
});
test('Reassembly restores every group and the hem follows the fabric at both limits',()=>{
 const m=createRoller();for(const d of [0,.4,1]){m.pose(d,0);const positions=m.root.children.map(g=>g.position.clone());m.pose(d,1);m.pose(d,0);m.root.children.forEach((g,i)=>assert.ok(g.position.equals(positions[i])));assert.equal(m.groups.rail[0].position.y,-spec.travel*d-6)}
});
