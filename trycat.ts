/**
 * Interface for the Result type.
 */
interface ResultBase<T, TErr> {
	/**
	 * A type guard that checks if this Result is Ok. If it is, the Result is cast to Ok.
	 * @returns true if this Result is Ok, false otherwise.
	 */
	isOk(): this is Ok<T>

	/**
	 * A type guard that checks if this Result is Err. If it is, the Result is cast to Err.
	 * @returns true if this Result is Err, false otherwise.
	 */
	isErr(): this is Err<TErr>

	/**
	 * Calls the provided function with the contained value if this Result is Ok.
	 * Nothing is performed otherwise.
	 *
	 * @param f - The function to be called if this Result is Ok. First arg will receive the contained value.
	 *
	 * @returns This Result.
	 */
	inspect(f: (value: T) => unknown): this

	/**
	 * Calls the provided function with the contained value if this Result is Err.
	 * Nothing is performed otherwise.
	 *
	 * @param f - The function to be called if this Result is Err. First arg will receive the contained error.
	 *
	 * @returns This Result.
	 */
	inspectErr(f: (error: TErr) => unknown): this

	/**
	 * If this Result is Ok, calls the given mapper function with the current contained value
	 *  and returns a new Result containing the value returned by the mapper function.
	 *
	 * @param mapper - The function that maps the current contained value to another value.
	 *
	 * @returns A new Result object containing the value returned by the mapper function, or this if this is Err.
	 */
	map<TNew>(mapper: (value: T) => TNew): this | Result<TNew, TErr>

	/**
	 * If this Result is Ok, it does the same thing as {@link map}.
	 * Otherwise, returns the given default value.
	 *
	 * @param def -  The default value to be returned if this Result is Err.
	 * @param mapper - The function that maps the current contained value to another value if this Result is Ok.
	 *
	 * @returns A new Result object containing the value returned by the mapped function if this is Ok, otherwise the default value.
	 */
	mapOr<TNew, TDef>(def: TDef, mapper: (value: T) => TNew): TNew | TDef

	/**
	 * Same as {@link mapOr}, except if this is Err, the default value is returned lazily by the first callback
	 * which receives the contained error and returns the default value.
	 *
	 * @param errMapper - The function that maps the contained error value to a default value if this Result is Err.
	 * @param mapper - The function that maps the contained value to a new value if this Result is Ok.
	 *
	 * @returns The value returned by the error mapper if this is Err; The value returned by the value mapper if this is Ok.
	 */
	mapOrElse<TNew, TDef>(errMapper: (error: TErr) => TDef, mapper: (value: T) => TNew): TNew | TDef

	/**
	 * If this Result is Err, calls the given mapper with the current error value,
	 * then returns a new Result containing the new error value returned by the mapper.
	 * Otherwise, nothing is performed and this is returned.
	 *
	 * @param mapper - The function that maps the contained error value to another error value.
	 *
	 * @returns A new Result containing the error value returned by the mapper if this is Err, or this Result otherwise.
	 */
	mapErr<TNewErr>(mapper: (error: TErr) => TNewErr): this | Result<T, TNewErr>

	/**
	 * @returns the given Result if this Result is Err, otherwise this.
	 */
	or<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(res: TR): this | TR

	/**
	 * Calls the given callback with the contained error value if this Result is Err.
	 *
	 * @returns the Result returned by the given callback, otherwise this Result
	 */
	orElse<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(op: (error: TErr) => TR): this | TR

	/**
	 * @returns the given Result if this Result is Ok, otherwise this.
	 */
	and<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(res: TR): this | TR

	/**
	 * Calls the given callback with the contained value if this Result is Ok.
	 *
	 * @returns the Result returned by the given callback, otherwise this Result
	 */
	andThen<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(op: (value: T) => TR): this | TR

	/**
	 * @returns the contained value if this Result is Ok.
	 * @throws if this Result is Err
	 */
	unwrap(): T

	/**
	 * @returns the contained value if this Result is Ok or the given value otherwise.
	 */
	unwrapOr<TDef>(def: TDef): T | TDef

	/**
	 * Calls the given function with the contained error value and returns the value returned by the function if this Result is Err. Otherwise, returns the contained value.
	 *
	 * @returns The contained value if this Result is Ok or the value returned by the given function otherwise.
	 */
	unwrapOrElse<TDef>(op: (error: TErr) => TDef): T | TDef

	/**
	 * Returns the contained value if this Result is Ok, otherwise throws with the given error message.
	 *
	 * @param message - The error message to be displayed if this Result is Err.
	 *
	 * @returns The contained value if this Result is Ok.
	 * @throws An error with the given error message if this Result is Err.
	 */
	expect(message: string): T

	/**
	 * @returns the contained error value if this Result is Err.
	 * @throws the contained value if this Result is Ok
	 */
	unwrapErr(): TErr

	/**
	 * Returns the contained error value if this Result is Err, otherwise throws with the given error message.
	 *
	 * @param message - The error message to be displayed if this Result is Ok.
	 *
	 * @returns The contained error value if this Result is Err.
	 * @throws An error with the given error message if this Result is Ok.
	 */
	expectErr(message: string): TErr
}

/**
 * Stores the result of a successful operation.
 * Access the contained via {@link Ok.value}.
 * Refer to {@link ResultBase} for available methods.
 *
 * @see ResultBase
 */
class Ok<T> implements ResultBase<T, never> {
	constructor(public readonly value: T) {}

	isOk(): this is Ok<T> {
		return true
	}

	isErr(): this is Err<never> {
		return false
	}

	inspect(f: (value: T) => unknown): this {
		f(this.value)
		return this
	}

	inspectErr(f: (error: never) => unknown): this {
		return this
	}

	map<TNew>(mapper: (value: T) => TNew): Ok<TNew> {
		return new Ok(mapper(this.value))
	}

	mapOr<TNew, TDef>(def: TDef, mapper: (result: T) => TNew): TNew {
		return mapper(this.value)
	}

	mapOrElse<TNew, TDef>(errMapper: (error: never) => TDef, mapper: (value: T) => TNew): TNew {
		return mapper(this.value)
	}

	mapErr<TNewErr>(mapper: (error: never) => TNewErr): this {
		return this
	}

	or<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(other: TR): this {
		return this
	}

	orElse<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(op: (error: never) => TR): this {
		return this
	}

	and<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(other: TR): TR {
		return other
	}

	andThen<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(op: (value: T) => TR): TR {
		return op(this.value)
	}

	unwrap(): T {
		return this.value
	}

	unwrapOr<TDef>(def: TDef): T {
		return this.value
	}

	unwrapOrElse<TDef>(op: (error: never) => TDef): T {
		return this.value
	}

	expect(msg: string): T {
		return this.value
	}

	unwrapErr(): never {
		throw this.value
	}

	expectErr(msg: string): never {
		throw new Error(msg)
	}
}

/**
 * Stores the error of a failed operation.
 * Access the error via {@link Err.error}.
 * Refer to {@link ResultBase} for available methods.
 *
 * @see ResultBase
 */
class Err<TErr> implements ResultBase<never, TErr> {
	constructor(public readonly error: TErr) {}

	isOk(): this is Ok<never> {
		return false
	}

	isErr(): this is Err<TErr> {
		return true
	}

	inspect(f: (value: never) => unknown): this {
		return this
	}

	inspectErr(f: (error: TErr) => unknown): this {
		f(this.error)
		return this
	}

	map<TNew>(mapper: (value: never) => TNew): this {
		return this
	}

	mapOr<TNew, TDef>(def: TDef, mapper: (value: never) => TNew): TDef {
		return def
	}

	mapOrElse<TNew, TDef>(errMapper: (error: TErr) => TDef, mapper: (value: never) => TNew): TDef {
		return errMapper(this.error)
	}

	mapErr<TNewErr>(mapper: (error: TErr) => TNewErr): Err<TNewErr> {
		return new Err(mapper(this.error))
	}

	or<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(other: TR): TR {
		return other
	}

	orElse<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(op: (error: TErr) => TR): TR {
		return op(this.error)
	}

	and<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(other: TR): this {
		return this
	}

	andThen<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(op: (value: never) => TR): this {
		return this
	}

	unwrap(): never {
		throw new Error("Attempted to unwrap an Err value.")
	}

	unwrapOr<TDef>(def: TDef): TDef {
		return def
	}

	unwrapOrElse<TDef>(op: (error: TErr) => TDef): TDef {
		return op(this.error)
	}

	expect(message: string): never {
		throw new Error(message)
	}

	unwrapErr(): TErr {
		return this.error
	}

	expectErr(message: string): TErr {
		return this.error
	}
}

/**
 * Represents the result of a fail-able operation.
 * A successful operation returns {@link Ok}, and a failed operation returns {@link Err}.
 *
 * Refer to {@link ResultBase} for methods available on a {@link Result}.
 *
 * @see ResultBase
 */
type Result<T, TErr> = Ok<T> | Err<TErr>

function ok(): Ok<void>
function ok<T>(value: T): Ok<T>
function ok<T>(value?: T): Ok<T> | Ok<void> {
	return value ? new Ok(value) : new Ok(undefined)
}

function err(): Err<void>
function err<T>(error: T): Err<T>
function err<TErr>(error?: TErr): Err<TErr> | Err<void> {
	return error ? new Err(error) : new Err(undefined)
}

/**
 * Calls the given function, catches any thrown error into an {@link Err},
 * and wraps the returned value with an {@link Ok} if nothing goes wrong.
 */
function trys(fn: () => void): Result<void, unknown>
function trys<T>(fn: () => T): Result<T, unknown>
function trys<T>(fn: () => T | undefined): Result<void, unknown> | Result<T, unknown> {
	try {
		const retval = fn()
		return retval ? ok(retval) : ok()
	} catch (e: unknown) {
		return err(e)
	}
}

/**
 * Stores the result of the given {@link Promise} into a {@link Result}.
 * If the promise fails, {@link Err} is returned. If the promise succeeds, {@link Ok} is returned.
 *
 * @example
 * const res = await tryp(fetch("/my/api")).mapErr((err) => apiError(err))
 * if (res.isErr()) {
 *   return err(res.error)
 * }
 */
function tryp(promise: Promise<void>): Promise<Result<void, unknown>>
function tryp<T>(promise: Promise<T>): Promise<Result<T, unknown>>
function tryp<T>(promise: Promise<T>): Promise<Result<T, unknown> | Result<void, unknown>> {
	return promise.then((value) => ok(value)).catch((e) => err(e))
}

export { ok, err, trys, tryp }
export type { Result, ResultBase, Ok, Err }
