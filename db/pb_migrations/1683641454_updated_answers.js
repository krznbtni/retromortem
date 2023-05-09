migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("oe86c6v8z2gjowx")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1v4eoqqo",
    "name": "text",
    "type": "text",
    "required": true,
    "unique": false,
    "options": {
      "min": null,
      "max": 1000,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("oe86c6v8z2gjowx")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "1v4eoqqo",
    "name": "details",
    "type": "text",
    "required": true,
    "unique": false,
    "options": {
      "min": null,
      "max": 1000,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
