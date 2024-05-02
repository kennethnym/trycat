import { describe, expect, expectTypeOf, it, test, vi } from "vitest"
import { type Result, err, ok, tryp, trys, Err } from "./trycat"

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

	test("it accepts empty value", () => {
		const result = ok()
		expect(result.value).toBeUndefined()
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
		}).toThrow("mai")
	})

	test("expectErr throws with the given error message", () => {
		expect(() => {
			ok("mai").expectErr("mai exists")
		}).toThrow("mai exists: mai")
	})
})

describe("Err", () => {
	test("isOk returns false", () => {
		const result = err("error")
		expect(result.isOk()).toBeFalsy()
	})

	test("isErr returns true", () => {
		const result = err("error")
		expect(result.isErr()).toBeTruthy()
	})

	test("isErr casts Result to Err if true", () => {
		const result = err("error")
		if (result.isErr()) {
			expect(result.error).toEqual("error")
		} else {
			throw new Error("isErr should not return false")
		}
	})

	test("it accepts empty error", () => {
		const result = err()
		expect(result.error).toBeUndefined()
	})

	test("inspect does nothing and returns Err", () => {
		const fn = vi.fn()
		const result = err(401).inspect(fn)
		expect(fn).not.toBeCalled()
		expect(result.error).toEqual(401)
	})

	test("inspectErr calls the given function with the contained error value and returns Err", () => {
		const fn = vi.fn()
		const result = err(500).inspectErr(fn)
		expect(fn).toBeCalledWith(500)
		expect(result.error).toEqual(500)
	})

	test("map does nothing and returns Err", () => {
		const fn = vi.fn()
		const someErrors = ["some", "error"]
		const result = err(someErrors).map(fn)
		expect(fn).not.toBeCalled()
		expect(result.error).toEqual(someErrors)
	})

	test("mapOr returns the default value", () => {
		const fn = vi.fn()
		const result = err("fs error").mapOr("", fn)
		expect(fn).not.toBeCalled()
		expect(result).toEqual("")
	})

	test("mapOrElse calls the first function with the contained error value and returns the value returned by the function", () => {
		const fn = vi.fn()
		const result = err("asd").mapOrElse((error) => `${error}asd`, fn)
		expect(fn).not.toBeCalled()
		expect(result).toEqual("asdasd")
	})

	test("mapErr calls the given function with the contained error value and returns a new Err with the value returned by the function", () => {
		const result = err('{"error":"wrong_password"}').mapErr((json) => JSON.parse(json))
		expect(result.error).toEqual({ error: "wrong_password" })
	})

	test("or returns the given Result", () => {
		const result = err("idk").or(ok("hello"))
		expect(result.value).toEqual("hello")
	})

	test("orElse calls the given function with the contained error and returns the Result returned by the function", () => {
		const result = err("mai").orElse((name) => ok(`${name} san`))
		expect(result.value).toEqual("mai san")
	})

	test("and returns this Err", () => {
		const result = err("failure").and(ok("hello"))
		expect(result.error).toEqual("failure")
	})

	test("andThen returns this Err", () => {
		const fn = vi.fn()
		const result = err("failure").andThen(fn)
		expect(fn).not.toBeCalled()
		expect(result.error).toEqual("failure")
	})

	test("unwrap throws an error", () => {
		expect(() => {
			const result = err("failure").unwrap()
		}).toThrow("failure")
	})

	test("unwrapOrElse calls the given function with the contained error value and returns the value returned by the function", () => {
		const result = err(1).unwrapOrElse((error) => error + 1)
		expect(result).toEqual(2)
	})

	test("expect throws with the given error message", () => {
		expect(() => {
			err("internal").expect("error message")
		}).toThrow("error message: internal")
	})

	test("expectErr returns the contained error value", () => {
		const result = err(123)
		expect(result.expectErr("should error")).toEqual(123)
	})
})

describe("trys", () => {
	it("returns the value returned by the given function as an Ok", () => {
		const result = trys(() => {
			return 123
		})
		if (result.isOk()) {
			expect(result.value).toEqual(123)
		} else {
			throw new Error("Expected an Ok value, received an Err")
		}
	})

	it("catches the thrown error and returns it as an Err", () => {
		const result = trys(() => {
			throw "FAILED"
		})
		if (result.isErr()) {
			expect(result.error).toEqual("FAILED")
		} else {
			throw new Error("Expected an Err, received an Ok")
		}
	})

	it("works with void function", () => {
		const result = trys(() => {})
		if (result.isOk()) {
			expect(result.value).toBeUndefined()
		} else {
			throw new Error("Expected an Ok value, received an Err")
		}
	})
})

describe("tryp", () => {
	it("returns the resolved value of the given promise as an Ok", async () => {
		const result = await tryp(Promise.resolve(123))
		if (result.isOk()) {
			expect(result.value).toEqual(123)
		} else {
			throw new Error("Expected an Ok value, received an Err")
		}
	})

	it("returns the error returned by the Promise as an Err", async () => {
		const result = await tryp(Promise.reject("FAILED"))
		if (result.isErr()) {
			expect(result.error).toEqual("FAILED")
		} else {
			throw new Error("Expected an Err, received an Ok")
		}
	})

	it("works with void Promise", async () => {
		const result = await tryp(Promise.resolve())
		if (result.isOk()) {
			expect(result.value).toBeUndefined()
		} else {
			throw new Error("Expected an Ok value, received an Err")
		}
	})
})
