#code-challenge #koa #mongo #nodejs #pt-br #relay

Tempo estimado de leitura: **26 minutos**.

> Me deu vontade de voltar a escrever. Talvez eu faça um blog.

## Introdução

Esse será um resumo colocando em prática tudo que li sobre GraphQL e Relay. Mas antes disso, uma breve história - não quer saber como eu cheguei aqui? [Clique aqui](#bootstrapping) e você irá direto à mão na massa.

Há algumas semanas vi um post no X sobre uma empresa que estava contratando ([Woovi](https://woovi.com)), o que me chamou atenção foi haver pessoas recomendando aplicar, uma grande chance de aprender coisas novas. Não foi a primeira vez que vi um post do [@sseraphini](https://x.com/sseraphini), então resolvi dar uma olhada no [repositório com as vagas disponíveis](https://github.com/woovibr/jobs/).

### A vaga e eu

Depois de ver a proposta de cada vaga, me interessei por este desafio: [Woovi Challenge - Crud Bank GraphQL Relay](https://github.com/woovibr/jobs/blob/main/challenges/crud-bank-graphql-relay.md). Atualmente sou um desenvolvedor front-end numa startup de segurança documental e blockchain ([TKNC](https://tknc.com.br/)) a descrição da vaga continha várias coisas que eu não conhecia ([Koajs](https://koajs.com/) e [Relay](https://relay.dev/)) outras que eu só tinha ouvido falar ([MongoDB](https://www.mongodb.com/) e [GraphQL](https://graphql.org/)) e outras que eu conhecia ([NodeJS](https://nodejs.org/en) e [React](https://react.dev/)). 

### GraphQL

Comecei a estudando sobre [GraphQL](https://graphql.org/), direto da fonte, lendo de fazendo os exemplos da própria [documentação](https://graphql.org/learn/), schemas, tipos, queries, mutations, subscriptions. A vontade de utilizar, pelo menos uma vez, foi só crescendo, a representação visual de como os dados serão retornados é intuitiva demais pra quem mexe com front-end - já imaginou não ter que incomodar o amigo que trabalho no back pra adicionar aquela propriedade que estava faltando? Um dos últimos tópicos abordados pela documentação, é justamente o de [paginação](https://graphql.org/learn/pagination/), neste tópico nos somos apresentados a [connection specification](https://graphql.org/learn/pagination/#connection-specification), especificação que provê uma forma consistente e legível de fazer paginações com [GraphQL](https://graphql.org/)

### Relay

O próximo passo. Comece a ler a [documentação do Relay](https://relay.dev/docs) logo após terminar de ler a do [GraphQL](https://graphql.org/), com os conceitos frescos na mente, fazer o [tutorial](https://relay.dev/docs/tutorial/intro/) foi bem tranquilo e também importante, se eu não tivesse lido sobre o [Relay](https://relay.dev/), não teria aprendido a por em prática o uso de [fragments](https://relay.dev/docs/tutorial/fragments-1/), nem teria utilizado o [Suspense](https://react.dev/reference/react/Suspense) do React.

### Koajs

Dei somente uma olhada por cima, na própria [home page](https://koajs.com/) do framework, vi que era dos mesmos criadores do [Express](https://expressjs.com/), não sei justificar a escolha, vi que o uso era parecido com o framework citado anteriormente e deixei pra aprender com a mão na massa.

### MongoDB

Só tive experiências com bancos relacionais, [MySQL](https://www.mysql.com/) e [PostgreSQL](https://www.postgresql.org/), confesso que sempre escolho no automático - uso o [Neon](https://neon.com/) para estudo e não tive problemas até hoje. 

> A experiência que estou tendo com o [MongoDB](https://www.mongodb.com/) está sendo bem agradável.

### Recomendações de leitura

[Relay: the GraphQL client that wants to do the dirty work for you](https://dev.to/zth/relay-the-graphql-client-that-wants-to-do-the-dirty-work-for-you-55kd)

> Este é o primeiro de uma séries de artigos que ajudam a clarear o modelo mental para utilizar o Relay.

[Documentação do GraphQL](https://graphql.org/learn/)
[Documentação do Relay]([documentação do Relay](https://relay.dev/docs))

## Bootstrapping

O desafio da vaga em questão ([Woovi Challenge - Crud Bank GraphQL Relay](https://github.com/woovibr/jobs/blob/main/challenges/crud-bank-graphql-relay.md)) manda começar usando esse repositório de boilerplate: [woovi-playground](https://github.com/woovibr/woovi-playground). Apesar de não ter feito isso, o repositório foi usado de base pra várias decisões que tomei. Notei que o repositório se tratava de um monorepo, e ambos `server` e `web` ficavam juntos dentro de uma pasta `apps`. 

### Koa, Docker, MongoDB

A primeira coisa que fiz foi criar um `Hello world!` para ter um contato com a API do Koa, feito isto, o próximo passo foi o endpoint `/status`, usando o [woovi-playground](https://github.com/woovibr/woovi-playground) como base, criei o `compose.yaml` com a [imagem do mongo](https://hub.docker.com/_/mongo). O próximo passo foi estabelecer a conexão com o banco utilizando o [mongoose](https://mongoosejs.com/). Com a conexão estabelecida, parti para criação do teste - este é o único endpoint que utiliza não utiliza GraphQL. É um [teste simples](https://github.com/alvesluc/woovi-challenge/blob/main/server/src/__tests__/status/get.status.test.ts), que espera que o endpoint retorne a versão do banco e se a conexão está sendo estabelecida.

A segunda foi a criação no endpoint `/graphql` o [woovi-playground](https://github.com/woovibr/woovi-playground) já vem com uma configuração de `ws` no endpoint `/graphql/ws` que eu decidir por não usar inicialmente.

### Schema

Para o `schema.graphql`, estou usando o repositório [relay-workshop](https://github.com/sibelius/relay-workshop.git) de base - encontrei esse repositório no repositório que indexa desafios completos por outras pessoas, repositório: [awesome-woovi-challenge](https://github.com/woovibr/awesome-woovi-challenge). Até agora, pelo que eu entendi, o schema não é utilizando no backend - ambos repositórios têm implementações do script `updateSchema.ts`, e em ambos os casos o `schema.graphql` só é utilizado no `relay.config.js`, como só estou fazendo a parte do backend, estou mantendo o schema atualizado manualmente, mas **ainda** não tive a necessidade de implementar o script `updateSchema`.

> Eu achava que o `schema.graphql` seria utilizado nas configurações do `graphqlHTTP`, mas não. 

Para que o endpoint `/graphql` ficasse acessível eu precisava de um objeto do tipo `GraphQLSchema` como parâmetro para a configuração do `graphqlHTTP`, consegui fazer rodar, a interface do `GraphiQL` ainda retorna erros, por não haver `fields` definidos no tipo `Query` e no tipo `Mutation`.

### O módulo `user`

Decidi começar implementando a mutation `UserRegisterWithEmail`, pois uma vez que tivesse um usuário criado e autenticado as outras queries poderiam ser feitas.

#### Sequência lógica para criação de um módulo

Tanto no [relay-workshop](https://github.com/sibelius/relay-workshop.git), quando no [woovi-playground](https://github.com/woovibr/woovi-playground) , os módulos eram divididos em "três partes", sendo elas `Loader`, `Model` e `Type`. Por onde começar? O que não tiver `import` dos outros é um bom ponto de partida, `Model`, vamos lá. 

##### Criando o `Model`

O `Model` é a representação do tabela (ou documento) no mongo, esse foi o mais tranquilo de fazer, criar uma interface para definir o tipo do `Model`, seguindo os repositórios de exemplo e levando o desafio em consideração, esse foi a interface resultante:

```TypeScript
export interface IUser extends Document {
	name: string;
	email: string;
	balance: number;
	password: string;
	authenticate: (plainTextPassword: string) => boolean;
	encryptPassword: (password: string) => string;
	createdAt: Date;
	updatedAt: Date;
}
```

O `Model` completo pode ser visto [aqui](https://github.com/alvesluc/woovi-challenge/blob/main/server/src/modules/user/UserModel.ts).

##### `Type` & `Loader`

A primeira dificuldade que eu tive foi aqui, ambos dependiam do `Model`, o `Loader` dependia de um `loaderRegister` e de um pacote externo ([`@entria/graphql-mongo-helpers`](https://github.com/woovibr/graphql-mongo-helpers)). Já o `Type`, dependia do `Loader` e também do pacote externo.

> Logicamente o próximo passo seria a criação do `Loader`, mas aqui eu notei que estava no modo automático, entendo apenas por cima o que o `Loader` fazia e não entendendo a necessidade da instalação do [`@entria/graphql-mongo-helpers`](https://github.com/woovibr/graphql-mongo-helper). O próprio nome `helpers` indica o pacote inclui facilitadores, e depois de olhar o arquivo [`documentResolvers.ts`](https://github.com/woovibr/graphql-mongo-helpers/blob/main/src/documentResolvers.ts) decidi por remover o pacote e continuar fazendo de uma forma mais "bare bones". 
> 
> Refatorar no futuro readicionando o pacote não será um problema.

Partindo para criação do `Type`, do tipo `GraphQLObjectType<TSource, TContext>` onde `TSource` receberá a interface `IUser` e o `TContext`, sendo o tipo do objeto `context` disponibilizado pelo `graphqlHTTP`, que por enquanto é `{}`, então deixei como `any`. A criação dos `fields` foi tranquila, faltando apenas deixar o `Type` "fetchable" via node, que trouxe a necessidade da criação do `nodeInterface`, que por enquanto está assim:

```TypeScript
import { fromGlobalId, nodeDefinitions } from "graphql-relay";
import { UserModel } from "../user/UserModel";
import { UserType } from "../user/UserType";
  
const { nodeInterface, nodeField, nodesField } = nodeDefinitions(
  async (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    
	if (type === "User") {
	  return await UserModel.findById(id);
	}
	
    return null;
  },
  (obj) => {
	if (obj instanceof UserModel) {
	  return UserType.name;
	}
	
	return undefined;
  }
);

export { nodeInterface, nodeField, nodesField };
```

#### UserRegisterWithEmailMutation

Com o `UserModel` e o `UserType` definidos, parti para criação da primeira mutation. A estrutura vazia é fácil de entender, exportar um `mutationWithClientMutationId` que tem as propriedades: `name`, `inputFields`, `mutateAndGetPayload` e `outputFields`. 

A validação e criação do usuário ocorre no `mutateAndGetPayload`. Surgindo a necessidade de expor um `user` e um método `setCookie` acessíveis via `context`, fiz criação de seu tipo concreto:

```TypeScript
import { IUser } from "./modules/user/UserModel";

export type GraphQLContext = {
  user?: IUser;
  setCookie: (cookieName: string, token: string) => void;
};
```

Agora o `TContext`, citado [aqui](#`Type`%20&%20`Loader`) deixou de ser `any`.

> Por algum motivo, o `ctx` retornado pelo `graphqlHTTP` é diferente do retornado numa rota normal, como na `/status`, e pra ter acesso ao `Context` do `Koa`, é preciso fazer `ctx.ctx`, demorei pra descobrir isso, pra deixar o `setCookie` visível pelo contexto levou um tempinho.

##### Testes

Uma vez que a mutation estava funcionando pelo `GraphiQL`, parti para a criação do [teste de integração](https://github.com/alvesluc/woovi-challenge/blob/main/server/src/__tests__/graphql/user/mutations/UserRegisterWithEmailMutationTest.test.ts). A documentação do GraphQL explica como fazer [requests HTTP](https://graphql.org/learn/serving-over-http/#request-format), defini a `query`, `variables` fiz a requisição e voilà:

```json
{
  "data":{
    "UserRegisterWithEmail":{
      "token":"ey...hY",
      "me":{
        "id":"VX...TM=",
        "_id":"685...5c4736c24c25f42c53",
        "name":"Lucas Alves",
        "email":"lucas@mail.com",
        "createdAt":"2025-06-20T15:21:00.999Z",
        "updatedAt":"2025-06-20T15:21:00.999Z"
      },
      "error":null,
      "success":"User registered successfully.",
      "clientMutationId":null
    }
  }
}
```

Depois disso criei dois scripts para manter os testes num ambiente padronizado (`clearDatabase` e `disconnectMongoose`), esses foram os testes escritos:

1. `should successfully register a new user`
2. `should return an error when duplicated email `

#### UserLoginWithEmailMutation

A implementação desta mutation foi bem mais rápida, sendo basicamente uma versão com validações diferentes e mais enxuta de `UserRegisterWithEmailMutation`.

##### Testes

Nessa hora vi a necessidade de criar o script `createUser`, criando usuários gerados pelo `@faker-js/faker` diretamente no banco com o `mongoose`.

> Já tá na hora de fazer o commit de tudo isso.

Testes escritos:
1. should log in a user with valid 'email' and 'password'
2. should not log in a user with valid 'email' and invalid 'password'
3. should not log in a user with invalid 'email' and valid 'password'

### `me` query

Não tem muito para falar sobre. Basicamente foi a primeira query do sistema, ela apenas retorna o usuário presente no contexto, podendo ser `null` ou um usuário concreto.

##### Testes

Testes feitos:
1. without a logged user
	1. should return null 
2. UserRegisterWithEmailMutation
	1. should return the user when a valid token is given
3. UserLoginWithEmailMutation
	1. should return the user when a valid token is given 

### `node` query

Essa deve ser uma das coisas mais legais que o [GraphQL propõe](https://graphql.org/learn/global-object-identification/), esse já tinha sido resolvido quando eu precisei expor a propriedade `nodeInterface`, `nodeField` e `nodesField` foram adicionados juntos quando fiz a desestruturação da função `nodeDefinitions`. Daí foi só adicionar nos `fields` do `QueryType` e pronto. Sensacional.

##### Testes

Aqui eu descobri que minha implementação de `createUser` tem um problema, o id só recebe o valor de `globalIdField("User")` quando o usuário é criado a partir de uma mutation.

> Pretendo rever essa implementação depois de um tempo.

Considero que o teste ficou mais verboso do que eu esperava, mas está testando corretamente. Os testes daqui serão incrementais, por enquanto só há o `... on User`.

1. should return a null given an invalid id
2. should return a User when given id is from a User

###### Melhoria no `createUser`

O pacote `graphql-relay` exporta o método `toGlobalId`, que faz o mesmo que o `globalIdField` só que sem precisar pela mutation, mas para aplicar a mudança na propriedade `id` do usuário criado pelo mongoose, outra coisa precisou ser feita. Este era o código anteriormente:

```TypeScript
const newUser = await new UserModel({
	name: name,
	email: email,
	password: password,
}).save();

console.log(newUser.id); // 685614ad75686ae6aef8d437
console.log(newUser._id); // 685614ad75686ae6aef8d437
```
 
 A primeira mudança a ser feita, foi adicionar a propriedade `_id` explicitamente com o tipo `Types.ObjectId` na interface `IUser`, agora o `_id` deixa de ser do tipo `unknown` e pode ser utilizado como parâmetro para a função `toGlobalId`. Realizei a mudança e:

```TypeScript
const newUser = await new UserModel({
	name: name,
	email: email,
	password: password,
}).save();

newUser.id = toGlobalId("User", newUser._id.toString());

console.log(newUser.id); // 685614ad75686ae6aef8d437
console.log(newUser._id); // 685614ad75686ae6aef8d437
```

O `id` não estava sendo reatribuído. O mongoose tem um comportamento específico para o getter do `id` e não permite que ele receba outro valor de forma manual. O workaround que eu encontrei para poder fazer essa reatribuição do `id` foi utilizando o método `toObject` disponível no `newUser`.

```TypeScript
const newUser = await new UserModel({
	name: name,
	email: email,
	password: password,
}).save();

const userPlainObject = newUser.toObject();
const generatedGlobalId = toGlobalId("User", newUser._id.toString());
userPlainObject.id = generatedGlobalId;

console.log(newUser.id); // VXNlcjo2ODU2MjA2NDAzNDljMWI0ZjQ3ZGVjMmI=
console.log(newUser._id); // 685620640349c1b4f47dec2b
```

Agora sim! Antes eu estava executando a `UserRegisterWithEmailMutation` antes de poder fazer uma query com `node`, era a única forma de retornar um usuário com um `globalIdField`, agora o helper `createUser` também está retornando um identificador global válido reduzindo bastante do ruído da leitura do teste.

### O módulo `transaction`

O desafio requer que a réplica permita:

- Enviar uma transação
- Receber uma transação
- Calcular o saldo disponível de uma conta.

Para atender esses objetivos de forma mais objetiva possível criei o `Model` com as seguintes propriedades: `sender`, `receiver`, `amount` e `idempotencyKey`.

#### Idempotency Key

Ouvi falar pela primeira vez há pouco meses, no X, acho que foi em algum comentário do [Sam](https://x.com/samsantosb), mas a melhor explicação que vi foi [num vídeo do Galego](https://youtu.be/YNHKO_74sLU). O vídeo sugere duas formas de criar chaves de idempotência, a primeira é utilizando um `UUID`, e a segunda é uma chave composta. Um exemplo de chave composta seria gerando um hash de propriedades que identificam a transação: 

```TypeScript
const operationId = `${senderId}${receiverId}${amount}${hour}`;
const key = crypto.createHash('sha256').update(operationId).digest('hex');
```

Quero fazer uma validação para não permitir que uma mesma operação não seja concretizada se a mesma `idempotencyKey` for enviada num período de **5 minutos**. Encontrei duas formas de fazer isso, ambas utilizando **TTL**, a primeira - e mais recomendada, utilizando [Redis](https://redis.io/), a segunda utilizando mongoose, criando um `Model` separado incluindo uma `key` e a propriedade `createdAt` com um `expires` setada em `300` - o tempo do expires é medido em segundos, com 300 equivalendo aos 5 minutos que busco.

Decidi fazer a implementação utilizando Redis, pelos seguintes motivos:

1. Não queria criar uma tabela separada só para isso.
2. A implementação com `mongoose` utilizaria `try/catch` 
3. Curiosidade - nunca utilizei Redis antes.

#### TransationTransferMutation

Até agora essa foi a parte mais densa de coisas para fazer. Essa é a parte mais importante do sistema e várias garantias precisam ser implementadas e testadas. Minha primeira implementação foi feita dessa forma:

```TypeScript
const redisKey = `transaction_lock:${idempotencyKey}`;
const wasSet = await context.redis.set(redisKey, "1", "EX", 300, "NX");  

if (!wasSet) {
  return {
	error: "Duplicate transaction detected. Try again later.",
  };
}

const sender = await UserModel.findById(senderId);
const receiver = await UserModel.findById(receiverId);

// Validações

sender.balance -= amount;
receiver.balance += amount;

await sender.save();
await receiver.save();
```

A parte do lock me agradou, mas a parte da transferência nem tanto. Estava feio e funcionava, mas parecia errado. Aí que entra o [`updateOne()`](https://www.geeksforgeeks.org/mongoose-updateone-function/) e a segunda implementação - já com a criação da transação:

```TypeScript
// Lock via chave de idempotência
// Validações

await UserModel.updateOne(
  { _id: senderId, balance: { $gte: amount } },
  { $inc: { balance: -amount } },
);

await UserModel.updateOne(
  { _id: receiverId },
  { $inc: { balance: amount } },
);

const transaction = new TransactionModel({ 
  sender: senderId,
  receiver: receiverId,
  amount,
});

await transaction.save()
```

Não demorou muito pra surgir a pergunta "e se um desses updates falhar?". Bom, eu não havia implementado uma forma de fazer rollback, então...

##### `startSession`, `startTransaction`, `commitTransaction`,`abortTransaction` `endSession`

O mongoose fornece a opção de criar uma `session`, como [explicado na documentação](https://mongoosejs.com/docs/transactions.html), essa `sessions` serve para: **criar uma transação**, **fazer o commit da transação se ela suceder** ou **abortar a transação caso alguma operação dê `throw`**.

```TypeScript
const session = await mongoose.startSession();
session.startTransaction();

try { 
  // Lock via chave de idempotência
  // Validações
  
  await UserModel.updateOne(
	{ _id: senderId, balance: { $gte: amount } },
	{ $inc: { balance: -amount } },
	{ session }
  );

  await UserModel.updateOne(
	{ _id: receiverId },
	{ $inc: { balance: amount } },
	{ session }
  );

  const transaction = new TransactionModel({ 
	sender: senderId,
	receiver: receiverId,
	amount,	
  });

  await transaction.save({ session })
  
  await session.commitTransaction();
} catch {
  await session.abortTransaction();
  await context.redis.del(redisKey);
}
```

Existem detalhes de implementação omitidos para deixar a leitura mais concisa, mas agora, para que a transação realmente ocorra, todas as operações incluídas na `session` devem dar certo. Uma nova linha foi adicionada, para que o _lock_ não seja mantido quando a operação falhar e o usuário possa tentar novamente.

###### Replica Set

Para que a `session` possa ser utilizada, a instância do banco deve ter sua conexão estabelecida com um conjunto de réplicas(_replica set_), mudanças no `compose.yaml` e nas configurações do banco foram necessárias, passei por diversos problemas para estabelecer essa conexão com sucesso e só quando achei [essa resposta no StackOverflow](https://stackoverflow.com/a/71106644) que consegui fazer dar certo - sim, StackOverflow na época das LLMs.

##### Testes

1. `should successfully send a transaction`
2. `should successfully send a transaction and lock the same transaction for being sent twice`
3. `should return an error when sender is not found`
4. `should return an error when sender don't have enough balance`
5. `should return an error when receiver is not found`
6. `should return an error when sender and receiver are the same`
7. `should return an error when something goes wrong`
8. `should allow multiple transactions from same sender and receiver with different amounts being sent concurrently`

Todos os testes passaram de primeira, **com exceção o número 8**.

```Bash
MongoServerError: Caused by :: Write conflict during plan execution and yielding is disabled. :: Please retry your operation or multi-document transaction.
```

Conflito na escrita. Bom, como o erro sugeriu, parti para a implementação de uma lógica de retry. As diff do update seria basicamente isso:

```TypeScript
// Lock via chave de idempotência

let retries = 0;
let transactionResult: any = {}

while (retries < MAX_TRANSACTIONS_RETRIES) {
  // Criação da session
  try { 
	
  // Validações 
  // Exemplo de quando há erro:
  if (!sender) {
    await session.abortTransaction();
	transactionResult = { error: "Sender not found."}
	break;
  }
  
  // Aplicação das mudanças e criação da transação.
  const updateSenderResult = await UserModel.updateOne(
	{ _id: senderId, balance: { $gte: sender.balance } },
	{ $inc: { balance: -amount } },
	{ session }
  );
  
  if (updateSenderResult.modifiedCount === 0) {
	// Erro que causa um retry.
	throw new Error("BalanceConflict.");
  }

  // Quando não há erro:
  transactionResult = {
    id: transaction._id,
	success: "Transaction sent successfully.",
  };
  break;
  } catch {
  await session.abortTransaction();
  if (isBalanceConflict(error) || isWriteConflict(error)) {
	retries++;
	await new Promise((resolve) =>
	  setTimeout(resolve, RETRY_DELAY_IN_MS)
	);
	continue;
  }

  return {
	error: "Transaction failed. Please try again.",
  };
}

if (hasNotCompletedTransaction(transactionResult)) {
  transactionResult = {
	error: "Transaction failed after multiple retries. Please try again later.",
  };
  
  await context.redis.del(redisKey);
}

return transactionResult;
```

###### Testes adicionais

9. `should return an error for a zero amount transaction`
10. `should return an error for a negative amount transaction`
11. `should correctly handle concurrent transfers from multiple senders to a single receiver`
12. `should correctly process bidirectional concurrent transactions for a single user`
13. `should fail concurrent transfers when sender has insufficient balance`

> A autenticação está implementada, desativei a checagem apenas no ambiente de desenvolvimento a partir do valor `NODE_ENV === "development`.

### Finalizando o backend

Chegou o momento de passar o pente fino, agora é a hora de adicionar as coisas importantes que ficaram faltando. Adicionei o loader para `transaction` na implementação do `node` e também criei o respectivo teste, disponibilizei o JSON para importação no Postman e fiz a criação do `README.md`

#### Deploy

Isso é algo que eu ainda não sei se vou fazer, no momento vou fazer o envio do link com o repositório, somente com o backend, e ver se consigo um feedback.

> Foi divertido.