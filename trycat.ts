interface ResultBase<T, TErr> {
	isOk(this: this): this is Ok<T>

	isErr(this: this): this is Err<TErr>

	map<TNew>(this: this, mapper: (value: T) => TNew): this extends Ok<T> ? Ok<TNew> : Err<TErr>

	mapOr<TNew, TDef>(this: this, def: TDef, mapper: (result: T) => TNew): this extends Ok<T> ? TNew : TDef

	mapOrElse<TNew, TDef>(
		this: this,
		errMapper: (error: TErr) => TDef,
		mapper: (value: T) => TNew,
	): this extends Ok<T> ? TNew : TDef

	mapErr<TNewErr>(this: this, mapper: (error: TErr) => TNewErr): this extends Err<TErr> ? Err<TNewErr> : Ok<T>

	or<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(this: this, res: TR): this extends Ok<T> ? this : TR

	unwrap(this: this): T

	unwrapErr(this: this): TErr
}

interface Ok<T> extends ResultBase<T, never> {
	_ok: true
	value: T
}

interface Err<TErr> extends ResultBase<never, TErr> {
	_ok: false
	error: TErr
}

type Result<T, TErr> = Ok<T> | Err<TErr>

function ok<T>(value: T): Ok<T> {
	return {
		_ok: true,
		value,
		map<TNew>(mapper: (value: T) => TNew): Ok<TNew> {
			return ok(mapper(this.value))
		},
		mapOr<N, D>(def: D, mapper: (value: T) => N): N {
			return mapper(this.value)
		},
		mapOrElse<N, D>(errMapper: (error: never) => D, mapper: (value: T) => N): N {
			return mapper(this.value)
		},
		mapErr(mapper: (error: never) => unknown): Ok<T> {
			return this
		},
		unwrap() {
			return this.value
		},
		unwrapErr() {
			throw this.value
		},
		or(res: Result<unknown, unknown>): Ok<T> {
			return this
		},
		isOk() {
			return true
		},
		isErr() {
			return false
		},
	}
}

function err<TErr>(e: TErr): Err<TErr> {
	return {
		_ok: false,
		error: e,
		map<TNew>(mapper: (value: never) => TNew): Err<TErr> {
			return this
		},
		mapOr<N, D>(def: D, mapper: (value: never) => N): D {
			return def
		},
		mapOrElse<N, D>(errMapper: (error: TErr) => D, mapper: (value: never) => N): D {
			return errMapper(this.error)
		},
		mapErr<TNewErr>(mapper: (error: TErr) => TNewErr): Err<TNewErr> {
			return err(mapper(this.error))
		},
		unwrap() {
			throw new Error("Attempted to unwrap an Err value.")
		},
		unwrapErr() {
			return this.error
		},
		or<TOther, TOtherErr, TR extends Result<TOther, TOtherErr>>(res: TR): TR {
			return res
		},
		isOk() {
			return false
		},
		isErr() {
			return true
		},
	}
}

function trys<T>(fn: () => T): Result<T, unknown> {
	try {
		return ok(fn())
	} catch (e: any) {
		return err(e)
	}
}

function tryp<T>(promise: Promise<T>): Promise<Result<T, unknown>> {
	return promise.then((value) => ok(value)).catch((e) => err(e))
}

export { ok, err, trys, tryp }
export type { Result, Ok, Err }
