interface MetaData {
  statusCode: number
  statusMessage: string
}

export interface ResponseTemplate<T> {
  metaData: MetaData
  result: T
}
