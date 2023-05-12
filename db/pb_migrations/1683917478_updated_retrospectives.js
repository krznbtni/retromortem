migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("0ce9vd76ua8s3o2")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cuxzoozd",
    "name": "actions",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "lof22t72hn4a9d9",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": []
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("0ce9vd76ua8s3o2")

  // remove
  collection.schema.removeField("cuxzoozd")

  return dao.saveCollection(collection)
})
