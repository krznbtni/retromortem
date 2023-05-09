migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nksixnrarslsjjw")

  collection.createRule = "user = @request.auth.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nksixnrarslsjjw")

  collection.createRule = null

  return dao.saveCollection(collection)
})
