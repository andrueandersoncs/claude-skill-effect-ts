// Rule: Never use direct file I/O; use a Context.Tag service
// Example: File system operations
// @rule-id: rule-002
// @category: services
// @original-name: context-tag-filesystem

import * as fs from "node:fs/promises";
import {
	Context,
	Effect,
	Function,
	HashMap,
	Layer,
	Option,
	pipe,
	Ref,
} from "effect";
import { FileError } from "../_fixtures.js";

// ✅ Good: Context.Tag service for file system
class FileSystem extends Context.Tag("FileSystem")<
	FileSystem,
	{
		readonly readFile: (path: string) => Effect.Effect<string, FileError>;
		readonly writeFile: (
			path: string,
			content: string,
		) => Effect.Effect<void, FileError>;
		readonly appendFile: (
			path: string,
			content: string,
		) => Effect.Effect<void, FileError>;
		readonly exists: (path: string) => Effect.Effect<boolean>;
	}
>() {}

// Live layer implementation
const FileSystemLive = Layer.succeed(FileSystem, {
	readFile: (path) =>
		Effect.tryPromise({
			try: () => fs.readFile(path, "utf-8"),
			catch: (e) => new FileError({ path, cause: e }),
		}),
	writeFile: (path, content) =>
		Effect.tryPromise({
			try: () => fs.writeFile(path, content),
			catch: (e) => new FileError({ path, cause: e }),
		}),
	appendFile: (path, content) =>
		Effect.tryPromise({
			try: () => fs.appendFile(path, content),
			catch: (e) => new FileError({ path, cause: e }),
		}),
	exists: (path) =>
		Effect.tryPromise({
			try: () => fs.access(path),
			catch: Function.identity,
		}).pipe(
			Effect.as(true),
			Effect.orElse(Function.constant(Effect.succeed(false))),
		),
});

// Test layer implementation with in-memory store
const FileSystemTest = Layer.effect(
	FileSystem,
	Effect.gen(function* () {
		const store = yield* Ref.make(HashMap.empty<string, string>());

		return {
			readFile: (path: string) =>
				Ref.get(store).pipe(
					Effect.flatMap((files) =>
						pipe(
							HashMap.get(files, path),
							Option.match({
								onNone: () =>
									Effect.fail(new FileError({ path, cause: "Not found" })),
								onSome: Effect.succeed,
							}),
						),
					),
				),
			writeFile: (path: string, content: string) =>
				Ref.update(store, HashMap.set(path, content)),
			appendFile: (path: string, content: string) =>
				Ref.update(store, (files) =>
					pipe(
						HashMap.get(files, path),
						Option.getOrElse(Function.constant("")),
						(existing) => HashMap.set(files, path, existing + content),
					),
				),
			exists: (path: string) =>
				Ref.get(store).pipe(Effect.map(HashMap.has(path))),
		};
	}),
);

export { FileSystem, FileSystemLive, FileSystemTest };
