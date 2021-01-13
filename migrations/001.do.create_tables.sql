CREATE TABLE categories (
    "id" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, 
    "name" TEXT NOT NULL
);

CREATE TABLE lists (
    "id" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, 
    "name" TEXT NOT NULL,
    "categoryId" INTEGER REFERENCES categories(id)
);

CREATE TABLE items (
    "id" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY, 
    "name" TEXT NOT NULL,
    "listId" INTEGER REFERENCES lists(id),
    "complete" BOOLEAN
);