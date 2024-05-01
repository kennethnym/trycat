# trycat

`trycat` is a lightweight, type-safe, zero-dependency implementation of the [`Result` type](https://doc.rust-lang.org/std/result/enum.Result.html) in Rust.
It provides utilities to replace try-catch error handling with `Result` that provides various methods to
handle errors in a more type-safe, explicit manner.

## Usage and Example

`trycat` provides two functions, `trys` and `tryp`, that returns results of throwable synchronous and asynchronous operations as either `Ok` or `Err` respectively.

### `trys`

```ts
import * as fs from "node:fs"
import { type Result, trys } from "trycat"

function readTextFileSync(path: string): Result<string, string> {
  return trys(() => {
    return fs.readFileSync(path, "utf-8")
  }).mapErr((err) => {
    if (err instance of Error) {
      return err.message
    }
    return "unknown"
  })
}

const rows = readTextFileSync("./data.csv")
  .mapOr([], (content) => content.split('\n').map((line) => line.split(" ")))
```

You can also use the `ok` and `err` functions manually to create an `Ok` value or an `Err` value:

```ts
import * as fs from "node:fs"
import { type Result, ok, err } from "trycat"

function readTextFileSync(path: string): Result<string, string> {
  try {
    const content = fs.readFileSync(path, "utf-8")
    return ok(content)
  } catch (err: unknown) {
    if (err instance of Error) {
      return err(err.message)
    }
    return err("unknown")
  }
}

const rows = readTextFileSync("./data.csv")
  .mapOr([], (content) => content.split('\n').map((line) => line.split(" ")))
```

### `tryp`

`tryp` is an asynchronous version of `trys`:

```ts
type ApiError = "InternalError" | "NetworkError" | "ServerError" | "UnexpectedResponse"

const WeatherSchema = z.object({ ... })
type Weather = z.infer<typeof WeatherSchema>

function fetchWeather(): Promise<Result<Weather, ApiError>> {
  const res = await tryp(fetch("/api/weather"))
  if (res.isErr()) {
    return err("NetworkError")
  }
  if (res.value.status === 500) {
    return err("ServerError")
  }

  const json = await tryp(res.json())
  if (json.isErr()) {
    return err("UnexpectedResponse")
  }

  const weather = trys(() => WeatherSchema.parse(json)).mapErr((error): ApiError => {
    if (error instanceof ZodError) {
      return "UnexpectedResponse"
    }
    return "InternalError"
  })

  if (weather.isErr()) {
    return err(weather.error)
  }

  return ok(weather.value)
}
```

## Matching Rust's Implementation

The goal of this library is to match Rust's `Result` as close as possible. If there is anything missing, please file an issue.
