const grpc = require('grpc');
let protoLoader = require("@grpc/proto-loader");
let readline = require("readline");
const { read } = require('fs');

let reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let proto = grpc.loadPackageDefinition(
    protoLoader.loadSync("proto/vacaciones.proto", {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

const REMOTE_URL = "0.0.0.0:50050";

let cliente = new proto.work_leave.EmployeeLeaveDaysService(REMOTE_URL, grpc.credentials.createInsecure());

let idEmpleado;
let nombre;
let diasAcumulados;

const idEmpleadoQuestion = () => {
    return new Promise((resolve, reject) => {
        reader.question("Ingrese id del empleado: ", answer => {
            idEmpleado = parseInt(answer);
            console.log(idEmpleado);
            resolve();
        })
    })
}

const nombreQuestion = () => {
    return new Promise((resolve, reject) => {
        reader.question("Ingrese nombre del empleado: ", answer => {
            nombre = answer;
            console.log(nombre);
            resolve();
        })
    })
}
const diasAcumuladosQuestion = () => {
    return new Promise((resolve, reject) => {
        reader.question("Ingrese los dias acumulados del empleado: ", answer => {
            diasAcumulados = parseFloat(answer);
            console.log(diasAcumulados);
            resolve();
        })
    })
}

const diasSolicitadosQuestion = () => {
    return new Promise((resolve, reject) => {
        reader.question("Ingrese los dias solicitados por el empleado: ", answer => {
            cliente.EligibleForLeave({
                employee_id: idEmpleado,
                name: nombre,
                accrued_leave_days: parseFloat(diasAcumulados),
                requested_leave_days: parseFloat(answer)
            }, (err, resp) => {
                if (err != null) {
                    console.log(err.details);
                    resolve();
                    return;
                }
                if (resp.eligible) {
                    cliente.grantLeave({
                        employee_id: idEmpleado,
                        name: nombre,
                        accrued_leave_days: parseFloat(diasAcumulados),
                        requested_leave_days: parseFloat(answer)
                    }, (err, res) => {
                        console.log(res);
                    })
                }
                else {
                    console.log("no se le pueden otorgar dias al empleado.");
                }
            })
            reader.close();
            resolve();
        })
    })
}

const main = async () => {
    await idEmpleadoQuestion();
    await nombreQuestion();
    await diasAcumuladosQuestion();
    await diasSolicitadosQuestion()
}

main();