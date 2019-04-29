'use strict';



const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = dialogflow({debug: true});

var config = {
********************
};

admin.initializeApp(config);

const db = admin.firestore();


/*var getDoc = collectionRef.get()
.then(doc => {
if (!doc.exists) {
console.log('No such document!');
} else {
console.log('Document data:', doc.data());
}
})
.catch(err => {
console.log('Error getting document', err);
});
*/

app.intent('getting_info', (conv, {protocols}) => {
	const collectionRef = db.collection('charly1');
	const term = protocols.toLowerCase();
	const termRef = collectionRef.doc(`${term}`);

	//Ejecutamos la funcion get(), y usamos el snapshot que devuelve como parámetro para crear nuestra función:
	//.then(function(snapshot)) {const...}
	return termRef.get()
	.then((snapshot) => {
		const {title, name, author} = snapshot.data();
		console.log('FUNCIONA:', snapshot.data());
		conv.ask(`Here you go, about ${name}, this is a good paper to start ${title}. ` +
			`The author is ${author}, a very wise man`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, which transport protocol you were saying.');
		});
	});

	/*la idea es que pueda decir:
	1- ayúdame con pcr --> los main concepts son ... y los profesores...
	2-dime los profesores de pcr

	Entonces la idea es poner tanto subjects como professors como parametros y
	dependiendo de si el usuario dice solo el nombre de la asig o tb la palabra "profesores"
	pues hacer una cosa u otra
	*/
	app.intent('subjects', (conv, {subjects}) => {
		const collectionRef = db.collection('subjects');
		const term = subjects.toLowerCase();
		const termRef = collectionRef.doc(`${term}`);
		console.log(`DOCUMENT: ${term}`);
		//const documents = [];
		//const subject = subjects;

		return termRef.get()
		.then((snapshot) => {
			const {concepts, professors} = snapshot.data();//Te asigna a cada variable cada uno de los fields del documento
			console.log('FUNCIONA:', snapshot.data());
			console.log(`PROFESORES:${professors}`);
			conv.ask(`The main concepts of ${subjects} are ${concepts} and the professors are ${professors}. Do you want to know something more?`);
				}).catch((e) => {
					console.log('error:', e);
					conv.ask('Sorry, no such subject');
				});
			});

	/*
	app.intent('subjects', (conv, {subjects}) => {
		const term = subjects.toLowerCase();
		const collectionRef = db.collection(`${term}`);
		//const termRef = collectionRef.doc(`${term}`);
		//const documents = [];
		//const subject = subjects;

		return collectionRef.get()
		.then((snapshot) => {
			conv.ask(`The main concepts of ${subjects} are:`);
			snapshot.forEach(doc => {
				console.log('FUNCIONA');
				console.log(doc.id, '=>', doc.data());
				documents.push(doc.id);
				//conv.ask(doc.id);
			});
				conv.ask(`${documents}. Do you want to know something more?`);
				}).catch((e) => {
					console.log('error:', e);
					conv.close('Sorry, no such subject');
				});
			});
*/
			exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
