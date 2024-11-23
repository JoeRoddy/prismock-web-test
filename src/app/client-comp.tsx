'use client';

import { useEffect, useState } from 'react';
import { PrismockClient } from '../../prismock';

const client = new PrismockClient();

client.author.create({ data: { name: 'John' } });

export function ClientComponent() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    client.author.findMany().then((users) => {
      setUsers(users);
    });
  }, []);

  return (
    <div className="">
      client component users:
      <pre>{JSON.stringify(users, null, 2)}</pre>
      <button
        onClick={() => {
          client.author.create({ data: { name: 'Jane' } }).then((user) => {
            setUsers([...users, user]);
          });
        }}
      >
        new user!
      </button>
      <br />
      <button
        onClick={() => client.author.deleteMany().then(() => setUsers([]))}
      >
        delete
      </button>
    </div>
  );
}
