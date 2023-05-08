migrate((db) => {
  const collection = new Collection({
    "id": "0ce9vd76ua8s3o2",
    "created": "2023-05-05 17:35:47.536Z",
    "updated": "2023-05-05 17:35:47.536Z",
    "name": "retrospectives",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ghooow5n",
        "name": "title",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": 2,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "ukimddae",
        "name": "details",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 500,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "3mp2a1hv",
        "name": "scheduled",
        "type": "date",
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
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
      },
      {
        "system": false,
        "id": "gudsybhr",
        "name": "organizers",
        "type": "relation",
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "q5qwfpvm",
        "name": "attendees",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": []
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("0ce9vd76ua8s3o2");

  return dao.deleteCollection(collection);
})
