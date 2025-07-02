export const createIdempotencyKey = async (
  senderId: string,
  receiverId: string,
  amount: number
): Promise<string> => {
  const rawKey = `${senderId}:${receiverId}:${amount}`;

  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(rawKey);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hexHash;
};
