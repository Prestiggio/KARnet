import Dexie from 'dexie';

// Define the database
const db: any = new Dexie('autocompleter');
const sessionDb: any = new Dexie('session');

// Define the tables (schema)
db.version(1).stores({
  values: '++id, &[name+value], hit, remote, remoteId', // name is the primary key, values is an array of possible values.
  defaults: '&name, value'
});

sessionDb.version(1).stores({
  contents: '++id, &key, data'
});

export async function session(key: string, data: any = undefined) {
  const session = await sessionDb.contents.where({ key }).first()
  if(!session && data === undefined) {
    return null
  }

  if(data === undefined && session.data) {
    return JSON.parse(session.data);
  }

  if(session?.id) {
    await sessionDb.contents.update(session.id, { key, data:JSON.stringify(data)});
  }
  else {
    await sessionDb.contents.put({ key, data:JSON.stringify(data)});
  }
}

export async function session_delete(key: string) {
  await sessionDb.contents.where({ key }).delete();
}

export async function saveEntry(fieldName: string, value: any, hit: number = 1, remote: boolean = false, id?: number, remoteId?: string) {
  if(await db.values.where({name: fieldName, value: value}).first()) {
    return;
  }
  try {
    if (id) {
      return await db.values.update(id, { name: fieldName, value: value, hit, remote, remoteId });
    }
    else {
      return await db.values.put({ name: fieldName, value: value, hit, remote, remoteId });
    }
  } catch (error) {
    console.error(`Error adding/updating values for "${fieldName}":`, value, error);
  }
}

export async function deleteEntry(id: number) {
  return await db.values.delete(id)
}

export async function hit(id: number) {
  return await db.values.where({id: id}).modify((suggestion:any) => ++suggestion.hit);
}

export async function saveDefault(fieldName: string, value:any) {
  try {
    return await db.defaults.put({ name: fieldName, value: value });
  } catch (error) {
    console.error(`Error adding/updating values for "${fieldName}":`, value, error);
  }
}

export async function getDefault(fieldName: string) {
  try {
    return await db.defaults.where({ name: fieldName }).first();
  } catch (error) {
    console.error(`Error retrieving values for "${fieldName}":`, error);
  }
  return null; // returns an empty array in case of error
}

export async function updateEntry(id: number, value: any) {
  return await db.values.update(id, { value })
}

// Function to retrieve possible values for a text field
export async function getEntries(lib: string[]) {
  let res = null
  for(let li of lib) {
    if(res===null) {
      res = db.values.where({ name: li })
    }
    else {
      res = res.or('name').equals(li)
    }
  }
  if(res === null) {
    return []
  }
  try {
    const result = await (await res.sortBy('hit')).reverse();
    if (result) {
      return result;
    } else {
      return []; // returns an empty array if the field doesn't exist
    }
  } catch (error) {
    console.error(`Error retrieving values for "${lib.join('/')}":`, error);
    return []; // returns an empty array in case of error
  }
}

export async function findEntry(name: string, value: any) {
  if(value === null || value === '') {
    return true
  }
  try {
    return await db.values.where({ name, value }).first();
  } catch (error) {
    console.error(`Error retrieving item for "${name}":`, error);
    return []; // returns an empty array in case of error
  }
}

export async function findLastEntry(lib: string[]) {
  let res = null
  for(let li of lib) {
    if(res===null) {
      res = db.values.where({ name: li })
    }
    else {
      res = res.or({name: li})
    }
  }
  if(res === null) {
    return null
  }
  try {
    return await res.sortBy('id').reverse().first();
  } catch (error) {
    console.error(`Error retrieving item for "${name}":`, error);
    return null; // returns an empty array in case of error
  }
}

export async function emptyLib(name: string) {
  try {
    return await db.values.where({ name }).delete();
  } catch (error) {
    console.error(`Error emptying item for "${name}":`, error);
    return []; // returns an empty array in case of error
  }
}

export async function findEmptyEntry(name: string) {
  try {
    return await db.values.where({ name, value:'' }).first();
  } catch (error) {
    console.error(`Error retrieving item for "${name}":`, error);
    return []; // returns an empty array in case of error
  }
}

export default db;