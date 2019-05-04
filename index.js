'use strict';

const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = dialogflow({debug: true});
const {BasicCard, Button, Image} = require('actions-on-google');

var config = {
	*******************************
};

admin.initializeApp(config);

const db = admin.firestore();


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

	app.intent('subjects', (conv, {subjects}) => {
		const collectionRef = db.collection('subjects');
		const term = subjects.toLowerCase();
		const termRef = collectionRef.doc(`${term}`);
		console.log(`DOCUMENT: ${term}`);

		return termRef.get()
		.then((snapshot) => {
			const {concepts, professors} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			console.log('PROFESORES Y CONCEPTOS:');
			//console.log('FUNCIONA:', snapshot.data());
			//console.log(`PROFESORES:${professors}`);
			conv.ask(`The main concepts of ${subjects} are ${concepts} and the professors are ${professors}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});
	});

	app.intent('concepts of subjects', (conv, {subjects, temp_concepts}) => {
		const collectionRef = db.collection('subjects');
		const term = subjects.toLowerCase();
		const termRef = collectionRef.doc(`${term}`);

		return termRef.get()
		.then((snapshot) => {
			const {concepts} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			console.log('CONCEPTOS:');
			//console.log('FUNCIONA:', snapshot.data());
			//console.log(`PROFESORES:${professors}`);
			conv.ask(`The main concepts of ${subjects} are ${concepts}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});
	});

	app.intent('professors of subjects', (conv, {subjects, temp_professors}) => {


		const collectionRef = db.collection('subjects');
		const term = subjects.toLowerCase();
		const termRef = collectionRef.doc(`${term}`);

		return termRef.get()
		.then((snapshot) => {
			const {professors} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			console.log('PROFESSORS:');
			//console.log('FUNCIONA:', snapshot.data());
			//console.log(`PROFESORES:${professors}`);
			conv.ask(`The professors of ${subjects} are ${professors}. Do you want to know something more?`);
		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such subject');
		});
	});

	app.intent('Want more information - yes', (conv, {concepts}) => {
		if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) { //If there is no screen
			conv.ask('Sorry, try this on a screen device or select the ' +
			'phone surface in the simulator.');
			return;
		}
		else { //If there is screen
			const collectionRef = db.collection('concepts');
			const term = concepts.toLowerCase();
			console.log(`DOCUMENT IS ${term}`);
			const termRef = collectionRef.doc(`${term}`);

			//Aquí hay que hacer algo para guardar el contexto, para que cuando nos pregunten por un concepto devolverle la descripcion y preguntarle "Quieres saber algo más?"
			//y si nos dice que si, tendremos que tener guardado el nombre del concepto para ya devolverle los elementos del array que sean
			return termRef.get()
			.then((snapshot) => {
				const {info} = snapshot.data();//Think the name of these variables has to be the same than in firebase
				console.log(`INFO: ${info}`);
				//console.log(`PROFESORES:${professors}`);
				//conv.ask(`${description}. Do you want some additional information like a paper or a book about ${concepts}?`);

				const array_length = info.length;//Si tiene 4 elementos, es 4
				var rand = Math.floor(Math.random() * (array_length));//La declaro var porque no se si va a cambiar cuando hagamos lo de guardar el nº para no devolver el mismo
				console.log(`RANDOM IS ${rand}`);
				var title;
				var cite;
				var link;
				var img;

				switch(rand%4) {
					case 0:
					title = info[rand];
					cite = info[rand + 1];
					link = info[rand + 2];
					img	= info[rand + 3];
					break;
					case 1:
					title = info[rand - 1];
					cite = info[rand];
					link = info[rand + 1];
					img	= info[rand + 2];
					break;
					case 2:
					title = info[rand - 2];
					cite = info[rand - 1];
					link = info[rand];
					img	= info[rand + 1];
					break;
					case 3:
					title = info[rand - 3];
					cite = info[rand - 2];
					link = info[rand - 1];
					img	= info[rand];
					break;
				}
				conv.ask(`Here you have a source of information about ${concepts}:`, new Suggestions('Thank you, bye'));

				// Create a basic card
				conv.ask(new BasicCard({
					title: `${title}`,
					text: `${cite}`, //Si no pones una imagen, tienes que poner texto si o si
					buttons: new Button({
						title: 'Go to research paper',
						url: `${link}`,
					}),
					image: new Image({
						url: `${img}`,
						//alt: 'Image alternate text',
					}),
					display: 'CROPPED',
				}));
			}).catch((e) => {
				console.log('error:', e);
				conv.ask('Sorry, no such concept');
			});
		}
	});


	app.intent('concepts', (conv, {concepts}) => {

		const collectionRef = db.collection('concepts');
		const term = concepts.toLowerCase();
		console.log(`DOCUMENT IS ${term}`);
		const termRef = collectionRef.doc(`${term}`);

		return termRef.get()
		.then((snapshot) => {
			const {description} = snapshot.data();//Think the name of these variables has to be the same than in firebase
			console.log(`DESCRIPTION: ${description}`);
			//console.log(`PROFESORES:${professors}`);
			//conv.ask(`${description}. Do you want some additional information like a paper or a book about ${concepts}?`);

			conv.ask(`${description}. Do you want more information about ${concepts}?`);
			if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) { //If there is no screen
				conv.ask(new Suggestions('Yes', 'No'));
			}

		}).catch((e) => {
			console.log('error:', e);
			conv.ask('Sorry, no such concept');
		});

	});

	/*
	// Handle the Dialogflow intent named 'Default Welcome Intent'.
	app.intent('Default Welcome Intent', (conv) => {
	const name = conv.user.storage.userName;
	if (!name) {
	// Asks the user's permission to know their name, for personalization.
	conv.ask(new Permission({
	context: 'Hi there, to get to know you better',
	permissions: 'NAME',
}));
} else {
conv.ask(`Hi again, ${name}. What do you want to know?`);
}
});
*/

app.intent('Default Welcome Intent', (conv) => {
	//console.log(`ESTOY EN DEFAULT WELCOME INTENT`);
	//conv.user.storage = {};
	const name = conv.user.storage.userName;
	if (!name) {
		// Asks the user's permission to know their name, for personalization.
		conv.ask(new SignIn("For a better and personalized experience,"));
	}
	else {
		conv.ask(`Hi again, ${name}. What do you want to know?`);
		if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) { //If there is no screen
			conv.ask(new Suggestions('Tell me about PCR', 'What is Dialogflow', 'Office hours Mario Munoz'));
		}
	}
});

app.intent("Get signin", (conv, params, signin) => {
	if (signin.status === "OK") {
		const payload = conv.user.profile.payload;
		conv.user.storage.userName = payload.name;
		conv.user.storage.email = payload.email;
		console.log(`conv.user.storage.userName: ${conv.user.storage.userName}`);
		console.log(`conv.user.storage.email: ${conv.user.storage.email}`);
		conv.ask(`I got your account details, ${payload.name}. What do you want to do next?`);
		if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) { //If there is no screen
			conv.ask(new Suggestions('Tell me something about PCR', 'What is Dialogflow?', 'Which are the office hours of Carlos Delgado?'));
		}
	} else {
		conv.ask("Ok, no worries, but I will not be able to send you some useful information to your email. What do you want to know?");
		if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) { //If there is no screen
			conv.ask(new Suggestions('Tell me something about PCR', 'What is Dialogflow?', 'Which are the office hours of Carlos Delgado?'));
		}
	}
});
/*
// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
//Como le hemos puesto el evento "actions_intent_PERMISSION" creo que se lanza cuando pides permiso en cualquier otro intent para algo con new Permission
app.intent('Get permission', (conv, params, permissionGranted) => {
if (!permissionGranted) {
conv.ask(`Ok, no worries. What do you want to know?`);
if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) { //If there is no screen
conv.ask(new Suggestions('Tell me something about PCR', 'What is Dialogflow?', 'Which are the office hours of Carlos Delgado?'));
}
} else {
conv.user.storage = conv.user.name.display;
conv.ask(`Thanks, ${conv.data.userName}. What's your favorite color?`);
if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')) { //If there is no screen
conv.ask(new Suggestions('Tell me something about PCR', 'What is Dialogflow?', 'Which are the office hours of Carlos Delgado?'));
}
}
});
*/
//To access just the email in the payload, you can also use {@link User#email|conv.user.email}.


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
