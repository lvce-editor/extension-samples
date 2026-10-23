import process from 'process'

globalThis.process ||= process

export const processShimUrl = import.meta.url
export { process }
