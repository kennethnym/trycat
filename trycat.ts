interface ResultBase<T, TErr> {
	isOk(): this is Ok<T>

	isErr(): this is Err<TErr>

	inspect(f: (value: T) => unknown): this

	inspectErr(f: (error: TErr) => unknown): this

	map<TNew>(mapper: (value: T) => TNew): this | Result<TNew, TErr>

	mapOr<TNew, TDef>(def: TDef, mapper: (value: T) => TNew): TNew | TDef

	mapOrElse<TNew, TDef>(errMapper: (error: TErr) => TDef, mapper: (value: T) => TNew): TNew | TDef

	mapErr<TNewErr>(this: Result<T, TErr>, mapper: (error: TErr) => TNewErr): this | Result<T, TNewErr>

	or<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(res: TR): this | TR
	orElse<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(op: (error: TErr) => TR): this | TR

	and<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(res: TR): this | TR
	andThen<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(op: (value: T) => TR): this | TR

	unwrap(): T
	unwrapOr<TDef>(def: TDef): T | TDef
	unwrapOrElse<TDef>(op: (error: TErr) => TDef): T | TDef
	expect(message: string): T

	unwrapErr(): TErr

	expectErr(message: string): TErr
}

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
		throw new Err(message)
	}

	unwrapErr(): TErr {
		return this.error
	}

	expectErr(message: string): TErr {
		return this.error
	}
}

type Result<T, TErr> = Ok<T> | Err<TErr>

function ok<T>(value: T): Ok<T> {
	return new Ok(value)
}

function err<TErr>(error: TErr): Err<TErr> {
	return new Err(error)
}

function trys<T>(fn: () => T): Result<T, unknown> {
	try {
		return ok(fn())
	} catch (e: unknown) {
		return err(e)
	}
}

function tryp<T>(promise: Promise<T>): Promise<Result<T, unknown>> {
	return promise.then((value) => ok(value)).catch((e) => err(e))
}

export { ok, err, trys, tryp }
export type { Result, Ok, Err }
