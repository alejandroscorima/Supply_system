<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");
try {
    // Intenta incluir el archivo de conexión a la base de datos
    $bd = include_once "bdLogistica.php";

    // Verifica si se ha establecido la conexión a la base de datos
    if (!$bd) {
        throw new Exception("Error al incluir el archivo de conexión a la base de datos");
    }

    // Verifica si los parámetros GET requeridos están presentes
    if (!isset($_GET['user_id']) || !isset($_GET['user_role']) || !isset($_GET['destino']) || !isset($_GET['step_status'])) {
        throw new Exception("Faltan parámetros GET requeridos");
    }

    // Prepara la consulta SQL
    $user_id = $_GET['user_id'];
    $user_role = $_GET['user_role'];
    $destino = $_GET['destino'];
    $status = $_GET['step_status'];
    $status_set = '';
    if ($status === 'PENDIENTE') {
        $status_set = " AND a.step_status='PENDIENTE'";
    } else {
        $status_set = " AND a.step_status<>'PENDIENTE'";
    }
/* $bd = include_once "bdLogistica.php";

$user_id = $_GET['user_id'];
$user_role = $_GET['user_role'];
$destino = $_GET['destino'];

$status = $_GET['step_status'];
$status_set = '';
if($status === 'PENDIENTE'){
    $status_set=" AND a.step_status='PENDIENTE'";
}else{
    $status_set=" AND a.step_status<>'PENDIENTE'";
} */

if ($user_role == 'SUPERVISOR' || $user_role == 'ADMINISTRADOR') {
    if ($destino == 'NINGUNO') {
        $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante,
            c.id AS val_id,
            c.user_id AS val_user_id,
            c.order_id AS val_order_id,
            c.date AS val_date,
            c.hour AS val_hour,
            c.state AS val_state
            FROM (
                SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, 
                ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo,
                ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta,
                ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section, 
                ordenes.status, ordenes.observacion, ordenes.step_id, ordenes.step, ordenes.step_status, ordenes.folder_id, ordenes.fecha_gen, ordenes.hora_gen 
                FROM oscorp_supply.ordenes 
                WHERE ordenes.section = 'OFICINA' AND ordenes.user_id = ".$user_id."
            ) a 
            LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id 
            LEFT JOIN oscorp_supply.orders_validations c ON a.id = c.order_id 
            AND c.user_id = '".$user_id."' OR c.user_id IS NULL
            ORDER BY a.id DESC;");
    } else {
        if($destino=='TODOS'){ 
            $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante,
            c.id AS val_id,
            c.user_id AS val_user_id,
            c.order_id AS val_order_id,
            c.date AS val_date,
            c.hour AS val_hour,
            c.state AS val_state
            FROM (
                SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion,
                ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo,
                ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta,
                ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section,
                ordenes.status, ordenes.observacion, ordenes.step_id, ordenes.step, ordenes.step_status, ordenes.folder_id, ordenes.fecha_gen, ordenes.hora_gen 
                FROM oscorp_supply.ordenes 
                WHERE ordenes.section = 'OFICINA' 
            ) a 
            LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id 
            LEFT JOIN oscorp_supply.orders_validations c ON a.id = c.order_id 
            AND c.user_id = '".$user_id."' 
            ORDER BY a.id DESC;");
        }else{

                $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante,
                c.id AS val_id,
                c.user_id AS val_user_id,
                c.order_id AS val_order_id,
                c.date AS val_date,
                c.hour AS val_hour,
                c.state AS val_state
                FROM (
                    SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion,
                    ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo,
                    ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta,
                    ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section,
                    ordenes.status, ordenes.observacion, ordenes.step_id, ordenes.step, ordenes.step_status, ordenes.folder_id, ordenes.fecha_gen, ordenes.hora_gen 
                    FROM oscorp_supply.ordenes 
                    WHERE ordenes.section = 'OFICINA' AND ordenes.destino='".$destino."'
                ) a 
                LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id 
                LEFT JOIN oscorp_supply.orders_validations c ON a.id = c.order_id 
                AND c.user_id = ".$user_id." AND a.step_id = 1 ".$status_set."
                ORDER BY a.id DESC;");
            
        }
    }
}else{
    if ($user_role == 'SUPER ADMINISTRADOR') {
        if ($destino == 'NINGUNO') {
            $sentencia = $bd->prepare("SELECT * FROM oscorp_supply.ordenes WHERE ordenes.section='CASA';");
        } else {
            if($destino=='TODOS'){
            $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante,
                c.id AS val_id,
                c.user_id AS val_user_id,
                c.order_id AS val_order_id,
                c.date AS val_date,
                c.hour AS val_hour,
                c.state AS val_state
                FROM (
                    SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, 
                    ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo,
                    ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta,
                    ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section,
                    ordenes.status, ordenes.observacion,ordenes.step,ordenes.step_status, ordenes.step_id, ordenes.folder_id, ordenes.fecha_gen,
                    ordenes.hora_gen 
                    FROM oscorp_supply.ordenes 
                    WHERE ordenes.section = 'OFICINA'
                ) a 
                LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id 
                LEFT JOIN oscorp_supply.orders_validations c ON a.id = c.order_id 
				WHERE a.step_id = 1 ".$status_set."
                ORDER BY a.id DESC;");
            }
            else{
            $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante,
            c.id AS val_id,
            c.user_id AS val_user_id,
            c.order_id AS val_order_id,
            c.date AS val_date,
            c.hour AS val_hour,
            c.state AS val_state
            FROM (
                SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, 
                ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo,
                ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta,
                ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section,
                ordenes.status, ordenes.observacion,ordenes.step,ordenes.step_status, ordenes.step_id, ordenes.folder_id, ordenes.fecha_gen,
                ordenes.hora_gen 
                FROM oscorp_supply.ordenes 
                WHERE ordenes.section = 'OFICINA' AND ordenes.destino='".$destino."'
            ) a 
            LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id 
            LEFT JOIN oscorp_supply.orders_validations c ON a.id = c.order_id 
            WHERE a.step_id = 1 ".$status_set."
            ORDER BY a.id DESC;");
            }
        }
    } else{
        $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante
        FROM (SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social,
        ordenes.direccion, ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha,
        ordenes.destino, ordenes.tipo, ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area,
        ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta, ordenes.retencion, ordenes.retencion_percent, 
        ordenes.percepcion, ordenes.receipt, ordenes.txt,  ordenes.section, ordenes.status, ordenes.observacion,
        ordenes.step_id, ordenes.step, ordenes.step_status, ordenes.folder_id, ordenes.fecha_gen, ordenes.hora_gen 
        FROM oscorp_supply.ordenes
        WHERE  ordenes.section='OFICINA' AND ordenes.user_id=".$user_id." ) a 
        LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id 
        LEFT JOIN oscorp_supply.orders_validations c ON a.id = c.order_id 
        WHERE a.step_id = 1 ".$status_set."
        ORDER BY a.id DESC;");
    }
}




$sentencia->execute();
$orders = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($orders);
}   catch (Exception $e) {
    // Captura cualquier excepción que se produzca durante la ejecución del código
    // Imprime un mensaje de error detallado
    echo json_encode(array("error" => $e->getMessage()));
}





?>
