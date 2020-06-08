import express from 'express';
import path from 'path';
import cors from 'cors';
import { errors } from 'celebrate';

import routes from './reoutes';

const app = express();

app.use(cors());
app.use(express.json()); //Agregamos la funcionalidad de Json a App
app.use(routes);

//express.static -> se utiliza para retornar archivos estáticos (Imagenes, pdf, word, etc)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());

app.listen(3333); //Listen Port