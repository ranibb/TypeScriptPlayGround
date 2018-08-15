/* For an example we will use the standard Node module fs which contains functions for reading and writing 
files to the local file system. To make the module available we import it into our program with an import 
statement. This makes a standard node module fs available in our program under the name fs. So, if you type 
fs followed by a dot we get a list of all the members included in that package. In this lesson we will need 
two methods readFileSync and readFile for reading files in asynchronous respectively as synchronous way. */
import * as fs from "fs";

/* We start with the synchronous function to read a string from a file located in the project root folder. 
let’s call the function stringFromFile. Supply file name as parameter and get a string back as returned value. 
For the implementation apply the method readFileSync with the file name as parameter and store the returned 
value from this function in a constant data variable. Hovering over data we observe that it is of type buffer. 
A buffer is a temporary storage used for transfering data and can be converted to a string by the help of the 
method toString. This method takes a string encoding as an argument. Here we assume UTF8 as encoding. For 
error handling, we have the good old try catch, so we will rip our code in a try block and add a catch 
block for error handling. */
function stringFromFile(filename: string) : string {
    try {
        const data = fs.readFileSync(filename);
        return data.toString("UTF8");
    } catch (error) {
        console.log(error);
        return "";
    }
}

/* use the function stringFromFile with "input.txt" which is located in the root directory as argument */
console.log(stringFromFile("input.txt"));

/* Next lets try to do the same in an asynchronous way. Notice the difference between the two functions 
readFileSync() and readFile(). The readFile() doesn't return a value but takes a callback function as second 
input and provides the data read from the file as a parameter in a callback. So, define the callback inline 
by an arrow function with parameters error and data. And within the callback function first handle the 
error case and then convert the buffer into a string as like before. However, since we are inside the 
callback function we have a problem to return the value in the outer function. The best solution here is to 
recognize that the outer function becomes also an asynchronous function and therefore should be written as such 
a function that is without a return value but with a callback as last parameter that specifies what to do with 
the resulting string. For that we don't need a returned value from the function stringFromFileAsync, instead 
add a callback function that takes a string value and returns nothing (void). In the callback for readFile 
function as a last step after converting the buffer into a string invoke the callback function we just 
defined with a string value as parameter. */
function stringFromFileAsync(filename: string, callabck: (data: string) => void) {
    fs.readFile(filename, (error, data) => {
        if(error) {

        }
        let content = data.toString("UTF8");
        callabck(content)
    })
}

/* To test the asyncronus function, provide "input.txt" as a first parameter and a call back wrtitten as an 
arrow function as a second parameter. In our case, we just log the resulting data to the console. */
stringFromFileAsync("input.txt", (data) => console.log(data));

/* So for we studied the first variant of writing asynchronous functions by help of callbacks. For the second 
and third variant we use promises instead of callbacks. In order to distinguish the function name, we call our 
function stringFromFileAsyncP for promise and go back to the original function notation with just one 
parameter; the filename, and with a return value. But the return value is not a plain string but a promise of 
a string. So, using this function doesn't give us a string back, instead we get a promise that in the future 
we will receive a string value. Now within our function we return a new promise object; we just define by a 
function with two parameters: resolve and reject. With these parameters we determine when to reject the 
promise with an error and when to resolve the promise with the string value. For the implementation we use 
again, a node function readFile which works the traditional way with callbacks. In the error case we reject 
our promise with an error and in the success case we resolve it with a string content. This is the way to 
define an asynchronous function with promises. */

function stringFromFileAsyncP(filename: string) : Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (error, data) => {
            if(error) {
                reject(error)
            }
            let content = data.toString("UTF8");
            resolve(content);
        });
    });
}

/* For the application we have two options/variants:

The first is to use the .catch().then() syntax that makes use of the two methods for handling the reject and 
the resolve cases. Thus, after stringFromFileAsyncP with the filename as parameter we first add a catch() 
method that takes a handler with the error as parameter and in this reject case we just log the error message. 
Then to return the promise again we continue by adding the then() with a handler providing the string data 
promise. Here we also just log the string value. */
stringFromFileAsyncP("input.txt")
    .catch((error) => {
        console.log(error)
    })
    .then((data) => {
        console.log(data)
    })

/* For the application of promises since node version 7.6 we have also a second option/variant. The 
async-await pattern. For that define a function printFileContent and add the "async" keyword in front of the
"function" keyword. Within the function we then use the traditional try-catch-syntax for error handling like 
in the synchronous case. In the try block we extract the string value by using the keyword "await" in front of 
the promise returned by our function and then log the data. In the catch block we log the error message */
async function printFileContent(filename :string){
    try {
        let data = await stringFromFileAsyncP(filename);
        console.log(data);   
    }
    catch(error) {
        console.log(error);
    }
}
/* For a test invoke this method with a file as input*/
printFileContent("input.txt")
/* As you can observe the advantage of async-await pattern is that we might use a syntax intuitive and similar 
to the synchronous case. */

/*
*******************************************************
* *****************************************************
* * The chaining of multiple asynchronous functions. **
* *****************************************************
*******************************************************

***********
* Case: 1 * Chaining in the case of callbacks.
***********

For an example, we could divide our function into two parts. Part 1: The reading of the file which results in 
buffer data. Part 2:  A conversion from the buffer into a string value. */

/* For the first part, we modify the original function stringFromFileAsync. Change the name of the function to 
bufferFileAsync and change the result type provided in a callback to Buffer. Also remove the conversion and 
invoke the callback with the buffer data as input */
function bufferFileAsync(filename: string, callabck: (data: Buffer) => void) {
    fs.readFile(filename, (error, data) => {
        if(error) {
            console.log(error);
        }
        callabck(data)
    })
}

/*For the second part, create an additional function stringFromBufferAsync with a buffer data and callback 
function as parameters. The callback function is supposed to handle the string result. To implement the 
function, convert the buffer data into a string as we did before and invoke the callback function with a 
string value */
function stringFromBufferAsync(data: Buffer, callabck: (text: string) => void) {
    let text = data.toString("UTF8");
    callabck(text);
}

/* To apply the two functions, nest them as follows: start first with bufferFileAsync and in the call back use 
the buffer data as input for the function stringFromBufferAsync. And finally, in the call back of that 
function, log the resulting string value.*/
bufferFileAsync("input.txt", (data) => {
    stringFromBufferAsync(data, (text) => {
        console.log(text);
    })
})

/*

***********
* Case: 2 * Chaining in the case of Promises.
***********

/* Also rename the original function in a similar way as we did in the callback case. And change the return type 
into a promise of a buffer. Within the function remove the conversion and resolve directly with the buffer 
data */
function bufferFileAsyncP(filename: string) : Promise<Buffer> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (error, data) => {
            if(error) {
                reject(error)
            }
            resolve(data);
        });
    });
}

/* Also write an additional function stringFormBufferAsyncP which receives buffer data as input and returns a
promise of a string value. Within the curly braces return a new promise, skip the error case and resolve it
with a converted string value. */
function stringFromBufferAsyncP(data: Buffer) : Promise<string> {
    return new Promise((resolve, reject) => {
       let content = data.toString("UTF8")
       resolve(content);
    })
}

/* For the application we have two options/variants:

The first is to use the .catch().then() syntax. Change the input data for the then handler into buffer and 
return a new promise of a string which we get from the function stringFromBufferAsyncP. Next apply the then 
method again on this promise and log the resulting string value. */
bufferFileAsyncP("input.txt")
    .catch((error) => {
        console.log(error);
    })
    .then((data: Buffer) => {
        return stringFromBufferAsyncP(data);
    })
    .then((text) => console.log(text));

/* The second is to use async-await pattern. Therefore, update the async-await code to reflect chaining of 
both functions. In this case, the notation is simple and elegant, we retrieve first the buffer data with await 
and the function bufferFileAsyncP and second the string value with await and the function 
stringFromBufferAsyncP. Everything else we may leave untouched. */
async function printFileContent2(filename: string){
    try {
        let data = await bufferFileAsyncP(filename);
        let text = await stringFromBufferAsyncP(data);
        console.log(text);
    }
    catch(error) {
        console.log(error);
    }
}
printFileContent2("input.txt")