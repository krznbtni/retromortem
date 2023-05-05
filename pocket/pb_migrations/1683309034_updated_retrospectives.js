migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("0ce9vd76ua8s3o2")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "aonne1qn",
    "name": "state",
    "type": "select",
    "required": true,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "draft",
        "published",
        "in-progress",
        "finished"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("0ce9vd76ua8s3o2")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "aonne1qn",
    "name": "state",
    "type": "select",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "draft",
        "published",
        "in-progress",
        "finished"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
