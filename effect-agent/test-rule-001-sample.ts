// Sample file with new Promise() pattern
// This should trigger rule-001 violation

export function fetchUser(id: string): Promise<any> {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve({ id, name: "User" });
		}, 100);
	});
}
