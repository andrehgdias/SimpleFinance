export interface InstanceMapper {
  toPersistence: (instance: object) => object
  toInstance: (pojo: object) => object
}
