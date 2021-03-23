const fetch = require('node-fetch');

/**
  * QUESTION 1
  */
const data = [
    { value: "1", label: "One" },
    { value: "2", label: "Two" },
    { value: "3", label: "Three" },
  ];
  
// Good use of reduce here, but no need to write this extra code for creating a list
// You can simply map over the array of objects more elegantly with 1 line of code
const values = data.reduce((values, { value }) => {
    values.push(value);
    return values;
}, []);

// REQUESTED CHANGE:
const valuesTwo = data.map(({ value }) => value);

// console.log(values);
// console.log(valuesTwo);

/**
  * QUESTION 2
  */

async function getIndexes() {
    return await fetch('https://api.coingecko.com/api/v3/indexes').then(res => res.json());
 }
 
 async function analyzeIndexes() {
    // No need to create a new variable here, can simply assign the result of the function call
    // And adding a .then() after the asynchronous call will make the code more clear
    const indexes = await getIndexes().catch(_ => {
       throw new Error('Unable to fetch indexes');
    });
    return indexes;
 }

// REQUESTED CHANGE:
 async function analyzeIndexesTwo() {
    return await getIndexes().then(indexData => {
        return indexData;
    })
    .catch(_ => {
       throw new Error('Unable to fetch indexes');
    });
 }

 /**
  * QUESTION 3
  */
 // No need to create a separate state variable if you are going to simply assign it to ctx.state
  let state;
  const user = getUser();
  if (user) {
     const project = getProject(user.id);
     state = {
        user,
        project
     };
  }
  // No need for this else statement, you can simply assign the user and project
  // to the ctx.body object, and set to undefined if not defined 
  else {
     state = {
        user: null,
        project: null
     };
  }
  ctx.body = state;

  // REQUESTED CHANGES
  const user = getUser();
  let project = undefined;
  if(user) {
      project = getProject(user.id);
  }
  ctx.body = { user: user || undefined, project: project || undefined };
  return;


 /**
  * QUESTION 4
  */

  function getQueryProvider() {
    const url = window.location.href;
    // Can simply return the contents of this list, and the calling function can parse the results
    const [_, provider] = url.match(/provider=([^&]*)/);
    if (provider) {
       return provider;
    }
    return;
  }

  // REQUESTED CHANGES
  function getQueryProvider() {
    const url = window.location.href;
    return url.match(/provider=([^&]*)/);
}

/**
 * QUESTION 5
 */
 function getParagraphTexts() {
     // Nothing wrong here, looks good
     // Unless you meant to return the actual text content of each p tag
     // Then, you would do 'p.innerText' instead of just 'p'
    const texts = [];
    document.querySelectorAll("p").forEach(p => {
       texts.push(p.innerText);
    });
    return texts;
 }

 /**
  * QUESTION 6
  */
  function Employee({ id }) {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState({});
 
    useEffect(() => {
       getEmployee(id)
          .then(employee => {
             setEmployee(employee);
             setLoading(false);
          })
          .catch(_ => {
             setError('Unable to fetch employee');
             setLoading(false);
          });
    }, [id]);
 
    if (error) {
       return <Error />;
    }
 
    if (loading) {
       return <Loading />;
    }
 
    return (
       <Table>
          <Row>
              {/* Can simply map through the employee object and go through each key. */}
              {/* By doing that, the solution is data-agnostic, and so you don't need to know each key */}
             <Cell>{employee.firstName}</Cell>
             <Cell>{employee.lastName}</Cell>
             <Cell>{employee.position}</Cell>
             <Cell>{employee.project}</Cell>
             <Cell>{employee.salary}</Cell>
             <Cell>{employee.yearHired}</Cell>
             <Cell>{employee.wololo}</Cell>
          </Row>
       </Table>
    );
 }
 
 // REQUESTED CHANGE:
 function Employee({ id }) {
    // ...
    // ...
    return (
       <Table>
          <Row>
             {Object.keys(employee).map(key => {
                 return <Cell>{employee[key]}</Cell>
             })}
          </Row>
       </Table>
    );
 }


/**
 * QUESTION 7
 */
async function getFilledIndexes() {
   try {
      const filledIndexes = [];
      const indexes = await getIndexes();
      const status = await getStatus();
      const usersId = await getUsersId();
      
      // Instead of all this logic to create and return a list, we can simply reduce the indexes list
      for (let index of indexes) {
         if (index.status === status.filled && usersId.includes(index.userId)) {
            filledIndexes.push(index);
         }
      }
      return filledIndexes;
   } catch(_) {
      throw new Error ('Unable to get indexes');
   }
}

// REQUESTED CHANGES
async function getFilledIndexes() {
    try {
       const indexes = await getIndexes();
       const status = await getStatus();
       const usersId = await getUsersId();
       
       // Reduce the indexes into a list
       return indexes.reduce((indexes, index) => {
           if(index.status == status.filled && usersId.includes(index.userId)) {
               indexes.push(index);
           }
           return indexes;
       }, []);

    } catch(_) {
       throw new Error ('Unable to get indexes');
    }
 }

 /**
  * QUESTION 8
  */
  function getUserSettings(user) {
    // No need to chain ifs here, you can use a try/catch block instead
    // And if there are any errors, it will just return the empty object
    if (user) {
       const project = getProject(user.id);
       if (project) {
          const settings = getSettings(project.id);
          if (settings) {
             return settings;
          }
       }
    }
    return {};
 }

 // REQUESTED CHANGES
 function getUserSettings(user) {
    try {
        const project = getProject(user.id);
        return settings = getSettings(project.id);
    }
    catch(err) {
        return {};
    }
 }