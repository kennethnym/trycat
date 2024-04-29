# trycat

`trycat` is a lightweight, type-safe, zero-dependency implementation of the [`Result` type](https://doc.rust-lang.org/std/result/enum.Result.html) in Rust.

## Example

```ts
import { type Result, trys } from "trycat"

function readTextFileSync(path: string): Result<string, string> {
  return trys(fs.readFileSync(path, "utf-8")).mapErr((err) => {
    if (err instance of Error) {
      return err.message
    }
    return "unknown"
  })
}

const rows = readTextFileSync("./data.csv")
  .mapOr([], (content) => content.split('\n').map((line) => line.split(" ")))
```

