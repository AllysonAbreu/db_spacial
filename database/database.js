require('dotenv').config();

const { request } = require('express');
const {Client} = require('pg');
const client = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD
});

client.connect()
    .then(()=> console.log('Conectado!'))
    .catch(err => console.log(err.stack));

const addPonto = (request, response) =>{
    const {nome, cpf, lat, lng} = request.body;

    const query = `INSERT INTO ponto (nome, cpf, localizacao) VALUES ('${nome}','${cpf}', ST_GeomFromText('POINT(${lat} ${lng})'))`;

    client.query(query,(error, results) => {
            if(error){
                response.status(400).send(error);
                console.log(error);
                return;
            }
            response.status(200).send('Inserido');
        });
};

const getPontos = (request, response) =>{

    // SELECT ST_AsText(the_geom) FROM myTable;
    const query = `SELECT ST_AsText(localizacao) as localizacao FROM ponto`

    client.query(query,(error, results) => {
            if(error){
                response.status(400).send(error);
                console.log(error);
                return;
            }
            let res = results.rows.map((row) => {
                const latLong = row.localizacao.substring(6, row.localizacao.length - 1).split(' ');
                const point = {
                    lat: latLong[0],
                    lng: latLong[1],
                }
                return point
            })
            response.status(200).json(res)
        })
    };

module.exports = {
    addPonto,
    getPontos
};