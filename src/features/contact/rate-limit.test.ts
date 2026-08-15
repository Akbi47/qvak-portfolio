import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createInMemoryRateLimiter,
  type RateLimiter,
} from "./rate-limit";

interface MutableClock {
  time: number;
}

function makeLimiter(clock: MutableClock): RateLimiter {
  return createInMemoryRateLimiter({
    burstLimit: 2,
    burstWindowMs: 60_000,
    hourlyLimit: 5,
    hourlyWindowMs: 3_600_000,
    now: () => clock.time,
  });
}

function makeHourlyLimiter(clock: MutableClock): RateLimiter {
  return createInMemoryRateLimiter({
    burstLimit: 10,
    burstWindowMs: 60_000,
    hourlyLimit: 5,
    hourlyWindowMs: 3_600_000,
    now: () => clock.time,
  });
}

test("rate-limit: allows requests under the burst limit", () => {
  const clock: MutableClock = { time: 0 };
  const limiter = makeLimiter(clock);

  assert.equal(limiter.tryConsume("ip-1"), true);
  assert.equal(limiter.tryConsume("ip-1"), true);
});

test("rate-limit: rejects when the burst window is exhausted", () => {
  const clock: MutableClock = { time: 0 };
  const limiter = makeLimiter(clock);

  assert.equal(limiter.tryConsume("ip-1"), true);
  assert.equal(limiter.tryConsume("ip-1"), true);
  assert.equal(limiter.tryConsume("ip-1"), false);
});

test("rate-limit: different keys are independent", () => {
  const clock: MutableClock = { time: 0 };
  const limiter = makeLimiter(clock);

  assert.equal(limiter.tryConsume("ip-1"), true);
  assert.equal(limiter.tryConsume("ip-1"), true);
  assert.equal(limiter.tryConsume("ip-2"), true);
});

test("rate-limit: burst budget refills after the burst window elapses", () => {
  const clock: MutableClock = { time: 0 };
  const limiter = makeLimiter(clock);

  assert.equal(limiter.tryConsume("ip-1"), true);
  assert.equal(limiter.tryConsume("ip-1"), true);
  assert.equal(limiter.tryConsume("ip-1"), false);

  clock.time += 61_000;
  assert.equal(limiter.tryConsume("ip-1"), true);
});

test("rate-limit: rejects once the hourly cap is reached", () => {
  const clock: MutableClock = { time: 0 };
  const limiter = makeHourlyLimiter(clock);

  for (let i = 0; i < 5; i++) {
    assert.equal(limiter.tryConsume("ip-1"), true, `attempt ${i}`);
  }
  assert.equal(limiter.tryConsume("ip-1"), false);
});

test("rate-limit: hourly cap resets after the hourly window elapses", () => {
  const clock: MutableClock = { time: 0 };
  const limiter = makeHourlyLimiter(clock);

  for (let i = 0; i < 5; i++) {
    assert.equal(limiter.tryConsume("ip-1"), true, `attempt ${i}`);
  }
  assert.equal(limiter.tryConsume("ip-1"), false);

  clock.time += 3_600_001;
  assert.equal(limiter.tryConsume("ip-1"), true);
});

test("rate-limit: reset clears all state", () => {
  const clock: MutableClock = { time: 0 };
  const limiter = makeLimiter(clock);

  for (let i = 0; i < 5; i++) {
    limiter.tryConsume("ip-1");
  }
  assert.equal(limiter.tryConsume("ip-1"), false);

  limiter.reset();
  assert.equal(limiter.tryConsume("ip-1"), true);
});
