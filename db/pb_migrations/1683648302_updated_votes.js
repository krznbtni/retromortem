migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nksixnrarslsjjw")

  collection.createRule = ""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nksixnrarslsjjw")

  collection.createRule = null

  return dao.saveCollection(collection)
})
