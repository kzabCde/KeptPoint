import test from "node:test";
import assert from "node:assert/strict";
import { getRewardState, rewardProgress } from "../lib/reward-state.ts";

test("points reward is locked below 75 percent",()=>assert.equal(getRewardState({rewardType:"points",pointsRequired:100,stampsRequired:null,stock:null,balance:50,stamps:0}),"locked"));
test("points reward is almost available at 75 percent",()=>assert.equal(getRewardState({rewardType:"points",pointsRequired:100,stampsRequired:null,stock:null,balance:75,stamps:0}),"almost"));
test("stamp reward becomes available at requirement",()=>assert.equal(getRewardState({rewardType:"stamps",pointsRequired:null,stampsRequired:10,stock:2,balance:0,stamps:10}),"available"));
test("out of stock overrides available balance",()=>assert.equal(getRewardState({rewardType:"points",pointsRequired:10,stampsRequired:null,stock:0,balance:100,stamps:0}),"out-of-stock"));
test("reward progress clamps to 100",()=>assert.equal(rewardProgress(20,10),100));
