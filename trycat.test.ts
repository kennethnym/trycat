import { describe, it, test, expect, expectTypeOf, vi } from "vitest"
import { ok, err, type Result } from "./trycat"

describe("Ok", () => {
	describe("isOk", () => {
		it("returns true", () => {
			const result = ok("test")
			expect(result.isOk()).toBeTruthy()
		})

		it("performs type casting to Ok", () => {
			const result: Result<number, string> = ok(2)
			if (result.isOk()) {
				expectTypeOf(result).toMatchTypeOf(ok(2))
			}
		})
	})

	describe("isErr", () => {
		it("returns false", () => {
			const result = ok("test")
			expect(result.isErr()).toBeFalsy()
		})
	})

	test("inspect calls the given function with the contained value", () => {
		const value = [1, 2, 3]
		const fn = vi.fn()
		const result = ok(value).inspect(fn)
		expect(fn).toBeCalledWith(value)
		expect(result.value).toEqual(value)
	})

	test("inspectErr does nothing and returns Ok", () => {
		const fn = vi.fn()
		const result = ok("test").inspectErr(fn)
		expect(fn).not.toBeCalled()
		expect(result.value).toEqual("test")
	})

	test("map maps the contained value to a new value stored in a new Ok", () => {
		const result = ok("2")
		const mapped = result.map((str) => Number.parseInt(str))
		expect(result.value).toEqual("2")
		expect(mapped.value).toEqual(2)
	})

	test("mapOr maps the contained value to a new value and returns it", () => {
		const result = ok('{"hello":"world"}')
		const json = result.mapOr({}, (json) => JSON.parse(json))
		expect(json).toEqual({ hello: "world" })
	})

	test("mapOrElse maps the contained value to a new value and returns it", () => {
		const result = ok(10)
		const errMap = vi.fn()
		const value = result.mapOrElse(errMap, (num) => num + 10)
		expect(errMap).not.toBeCalled()
		expect(value).toEqual(20)
	})

	test("mapErr does nothing and returns this", () => {
		const errMap = vi.fn()
		const result = ok(2).mapErr(errMap)
		expect(errMap).not.toBeCalled()
		expect(result.value).toEqual(2)
	})

	test("or returns this", () => {
		const result = ok("boomer").or(err(404))
		expect(result.value).toEqual("boomer")
	})

	test("orElse returns this", () => {
		const otherFn = vi.fn()
		const result = ok("chat").or(err("lmfao"))
		expect(otherFn).not.toBeCalled()
		expect(result.value).toEqual("chat")
	})

	test("and returns the given Result", () => {
		const result = ok(456).and(ok(123))
		expect(result.value).toEqual(123)
	})

	test("andThen calls the given function with the contained value and returns the other Result", () => {
		const result = ok("hello").andThen((str) => ok(`${str} world`))
		expect(result.value).toEqual("hello world")
	})

	test("unwrap returns the contained value", () => {
		const result = ok("present").unwrap()
		expect(result).toEqual("present")
	})

	test("unwrapOr returns the contained value", () => {
		const result = ok("present").unwrapOr("else")
		expect(result).toEqual("present")
	})

	test("expect returns the contained value", () => {
		const result = ok("mai").expect("error message")
		expect(result).toEqual("mai")
	})

	test("unwrapErr throws the contained value", () => {
		expect(() => {
			ok("mai").unwrapErr()
		}).toThrow()

		try {
			ok("mai").unwrapErr()
		} catch (err) {
			expect(err).toEqual("mai")
		}
	})

	test("expectErr throws with the given error message", () => {
		expect(() => {
			ok("mai").expectErr("mai exists")
		}).toThrow("mai exists")
	})
})
