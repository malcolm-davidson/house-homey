export const listingId = (address: string, row: number): string =>
  `${address.trim().toLowerCase().replace(/\s+/g, '-')}-${row}`;
