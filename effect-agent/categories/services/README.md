# Services & Layers

NEVER call external APIs, databases, or file systems directly. ALL effectful dependencies MUST be behind a Context.Tag service. Every service MUST have both a *Live and *Test layer implementation for full testability.
