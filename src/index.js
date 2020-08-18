//Importar Express e Uuidv4
const express = require('express');
const { uuid, isUuid } = require('uuidv4');

//Iniciar Express
const app = express();

//Adiciona Middleware para que o Express seja capaz e entender o JSON do body
app.use(express.json());

/* 
METODOS HTTP:
- GET: Buscar informacoes no back-end
- POST: Criar uma informacao no back-end
- PUT/PATCH: Alterar informacao no back-end
	- Put: para mudar tudo
	- Patch: para mudar informações especificas
- DELETE: Deletar uma informacao no back-end
*/

/*
SINTAXE DOS METODOS:
- Primeiro parametro: a URL, o recurso

- Segundo parametro: funcao com parametros de requisicao e resposta. Ela deve retornar algo para o usuario.
	Como ela retorna? 
		Ela usa um return e o response.
		O response tem varios metodos como send (para texto) e json (para json)
		Ex: return response.send('Hello World');
			return response.json({ message: 'Hello World})

*/

/*
TIPOS DE PARAMETROS:
- Query Params: Filtros e paginacao
	Eles vao na URL depois de ?
	Ex: localhost:3333/projects?title=React&owner=Diego
		Nos projetos nos queremos um com titulo React e que seja do Diego

- Route Params: Identificar recursos (Na hora de atualizar ou deletar)
	Eles vao na url depois da / com um :id
	Ex: localhost:3333/projects/1

- Request Body: Conteudo na hora de criar ou editar um recurso
	Eles nao vao na URL, vao no corpo do request
*/

/*
MIDDLEWARE

É um interceptador de requisicoes. Pode
	1. Interromper totalmente a requisicao (retornar sem chamar o next)
	2. Alterar dados da requisicao e prosseguir (chamar o next)
	Portanto! Nossas rotas sao middlewares

Ele eh uma funcao que recebe como parametros requisicao, resposta e next.
Nele vamos colocar tudo que quisermos rodar antes de todas as rotas ou de
alguma delas. Ao terminar de rodar o que quisermos rodar antes de cada rota
devemos usar o next() para prosseguir para o proximo middleware (nesse caso a rota!)

Aqui criamos um interceptador de rotas para listar quais metodos foram utilizados
e em quais rotas.

Para usar em todas as rotas:
	app.use(logRequests)

Para usar em rotas especificas:
	remova o app.use(logRequests)
	adicione o middleware na propria rota
		Ex: app.get('/projects', logRequests ,(request, response) => {...}
		(nesse caso ele so vai rodar na rota GET)

Tambem eh possivel usar em todas as rotas com uma URL em comum. 
	Ex:app.use('/projects:id', validateProjectId)
	Vai rodar apenas em PUT e DELETE. 
*/

const projects = [];

function logRequests(request, response, next) {
	const { method, url } = request;

	const logLabel = `[${method.toUpperCase()}] ${url}`;

	console.log(logLabel);

	return next();
}

function validateProjectId(request, response, next) {
	const { id } = request.params;
	if (!isUuid(id)) {
		return response.status(400).json({ error: 'Invalid project ID.' });
	}

	return next();
}

app.use(logRequests);
app.use('/projects/:id', validateProjectId);

app.get('/projects', (request, response) => {
	const { title, owner } = request.query;

	//Filtro para ver se inclui o titulo
	const results = title
		? projects.filter((project) => project.title.includes(title))
		: projects;

	return response.json(results);
});

app.post('/projects', (request, response) => {
	const { title, owner } = request.body;
	const project = { id: uuid(), title, owner };

	projects.push(project);

	return response.json(project);
});

app.put('/projects/:id', (request, response) => {
	const { id } = request.params;
	const { title, owner } = request.body;

	const projectIndex = projects.findIndex((project) => project.id === id);

	if (projectIndex < 1) {
		return response.status(400).json({ error: 'Project not found.' });
	}

	const project = { id, title, owner };

	//Substituir o item
	projects[projectIndex] = project;

	return response.json(project);
});

app.delete('/projects/:id', (request, response) => {
	const { id } = request.params;

	const projectIndex = projects.findIndex((project) => project.id === id);

	if (projectIndex < 1) {
		return response.status(400).json({ error: 'Project not found.' });
	}

	//Corta apenas o item
	projects.splice(projectIndex, 1);

	return response.status(204).send();
});

app.listen(3333, () => {
	console.log('😀️ Back-end rodando!');
});

//RODAR:  node ./src/index.js || yarn dev
