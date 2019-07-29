const hbs = require('hbs')
const fs= require('fs')

hbs.registerHelper('equals', function(arg1, arg2) {
    return (arg1 == arg2);
});

//Helpers CURSOS
hbs.registerHelper('cursosInteresado',(listaCursos)=>{
    let texto = '<div style="margin-left: 35%;margin-right: 35%" class="accordion" id="accordionExample">'
    let i = 1;
    listaCursos.forEach(cur => {
        if( cur.estado == "disponible"){
            texto = texto + `<div class="card">
                    <div class="card-header" id="heading${i}">
                    <h5 class="mb-0">
                        <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                           <b>Nombre del Curso</b>: ${cur.nombre} <br>
                           <b>Valor</b>: ${cur.valor}
                        </button>
                    </h5>
                    </div>
                   
                    <div id="collapse${i}" class="collapse show" aria-labelledby="heading${i}" data-parent="#accordionExample">
                    <div class="card-body">
                        <b>Descripcion</b>: ${cur.descripcion}<br>
                        <b>Modalidad</b>: ${cur.modalidad}<br>
                        <b>Intensidad</b>: ${cur.intensidad}
                    </div>
                    </div></div>`
        }   
        i = i + 1
    }); 
    texto = texto + `</div>`
    return texto
})

hbs.registerHelper('cursosCoor',(listaCursos)=>{
    let texto = '<div class="col-sm">\
            <table class="table">\
                <thead class="bg-success">\
                <tr>\
                <th scope="col">\
                    <center>ID</center>\
                </th>\
                <th scope="col">\
                    <center>Nombre</center>\
                </th>\
                <th scope="col">\
                    <center>Descripcion</center>\
                </th>\
                <th scope="col">\
                    <center>Intensidad</center>\
                </th>\
                <th scope="col">\
                    <center>Valor</center>\
                </th>\
                <th scope="col">\
                    <center>Modalidad</center>\
                </th>\
                <th scope="col">\
                    <center>Estado</center>\
                </th>\
                <th scope="col">\
                <center>Actualizar Estado</center>\
            </th>\
            </tr>\
        </thead>\
        <tbody>';
               
    listaCursos.forEach(cur => {
        texto = texto +
            '<tr>\
            <td class="text-center">'+cur.id+'</td>\
            <td class="text-center">'+cur.nombre+'</td>\
            <td class="text-center">'+cur.descripcion+'</td>\
            <td class="text-center">'+cur.intensidad+'</td>\
            <td class="text-center">'+cur.valor+'</td>\
            <td class="text-center">'+cur.modalidad+'</td>\
            <td class="text-center">'+cur.estado+'</td>\
            <td>\
            <form action="/actualizarCurso" method="POST">\
                <input type="hidden" name="id" value="'+cur.id+'">\
                <input type="submit" class="btn btn-danger" value="Cambiar">\
            </form>\
            </td>\
            </tr>';
    }); 
    texto = texto + '</tbody></table></div>'
    return texto
})

hbs.registerHelper('modificarCursos',(listaCursos)=>{
    let texto = '<div class="col-sm">\
            <table class="table">\
                <thead class="bg-success">\
                <tr>\
                <th scope="col">\
                    <center>ID</center>\
                </th>\
                <th scope="col">\
                    <center>Nombre</center>\
                </th>\
                <th scope="col">\
                    <center>Descripcion</center>\
                </th>\
                <th scope="col">\
                    <center>Intensidad</center>\
                </th>\
                <th scope="col">\
                    <center>Valor</center>\
                </th>\
                <th scope="col">\
                    <center>Modalidad</center>\
                </th>\
                <th scope="col">\
                <center>Modificar<br>Curso</center>\
            </th>\
            </tr>\
        </thead>\
        <tbody>';
               
    listaCursos.forEach(cur => {
        cur.modalidad === 'Presencial' ?  opcion = '<option value="Virtual">Virtual</option>' : opcion = '<option value="Presencial">Presencial</option>'
        texto = texto +
            '<tr>\
            <form action="/modificarCurso" method="POST">\
            <input type="hidden" name="id" value="'+cur.id+'">\
            <td class="text-center">'+cur.id+'</td>\
            <td class="text-center">  <input type="text" name="nombre" value="'+cur.nombre+'"></td>\
            <td class="text-center">  <input type="text" name="descripcion" value="'+cur.descripcion+'"></td>\
            <td class="text-center">  <input type="number" name="intensidad" value="'+cur.intensidad+'"></td>\
            <td class="text-center">  <input type="number" name="valor" value="'+cur.valor+'"></td>\
            <td class="text-center">  \
            <select name="modalidad" class="browser-default custom-select" >\
                    <option disabled value="'+cur.modalidad+'" selected>'+cur.modalidad+'</option>\
                    '+opcion+'\
            </select></td>\
            <td>\
                \
                <input type="submit" class="btn btn-success" value="Modificar">\
            </form>\
            </td>\
            </tr>';
    }); 
    texto = texto + '</tbody></table></div>'
    return texto
})

hbs.registerHelper('listarCursosDisponibles',(listaCursos)=>{
    let texto= `<div class="col-sm-5">
                <label for="selectCursos">Cursos Disponibles</label>
                <select id="selectCursos" name="id" class="browser-default custom-select" >`
    listaCursos.forEach(cur => {
        if(cur.estado == "disponible"){
            texto = texto + `<option value="${cur.id}">${cur.nombre}</option>`
        }
    });
    texto= texto + `</select> </div>`
 return texto
})

//Helpers INSCRITOS
hbs.registerHelper('mostrarInscritos',(cursos,inscritos) =>{
    let texto = "<div style='margin-left: 30%;margin-right: 30%' class='accordion' id='accordionExample'>"
    let i = 1,cont=1;
    cursos.forEach(cur => {
        if( cur.estado == "disponible"){
            texto = texto + `<div class="card">
                    <div class="card-header" id="heading${i}">
                    <h5 class="mb-0">
                        <button class="btn btn-link text-success" type="button" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                            <b>Nombre del Curso</b>: ${cur.nombre}
                        </button>
                    </h5>
                    </div>
                   
                    <div id="collapse${i}" class="collapse show" aria-labelledby="heading${i}" data-parent="#accordionExample">
                    <div class="card-body">
                    ${listarInscritos(inscritos,cur.id)}
                    </div>
                    </div>
                    </div>`
            cont = cont + 1
        }   
        i = i + 1
    }); 
    texto = texto + `</div>`
    return texto
})
const listarInscritos = (inscritos,curso) =>{
    let texto = '<table class="table">\
    <thead class="bg-success">\
    <th>Documento</th>\
    <th>Nombre</th>\
    <th>Eliminar</th>\
    <thead><tbody>';

    inscritos.forEach(inscripcion => {
        if(inscripcion.id == curso){
        texto = texto +
            `<tr>\
            <td>${inscripcion.documento}</td>\
            <td>${inscripcion.estudiante}</td>\
            <td>
            <form action="/eliminarInscrito" method="POST">
                <input type="hidden" name="curso" value="${inscripcion.id}" >
                <input type="hidden" name="estudiante" value="${inscripcion.documento}" >
                <input type="hidden" name="nomCurso" value="${inscripcion.curso}" >
                <input type="submit" class="btn btn-danger" value="Eliminar"> 
            </form>
            </td>\
            </tr>`;
        }
    }); 
    texto = texto + '</tbody></table>'
    return texto
}


