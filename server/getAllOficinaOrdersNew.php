
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");


$bd = include_once "bdLogistica.php";

$user_id=$_GET['user_id'];
$user_role=$_GET['user_role'];
$destino=$_GET['destino'];

if($user_role=='SUPERVISOR'||$user_role=='ADMINISTRADOR'){
    if($destino=='NINGUNO'){
        $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante FROM (SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo, ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta, ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section FROM oscorp_supply.ordenes WHERE ordenes.section='OFICINA' AND ordenes.user_id=".$user_id." ) a LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id ORDER BY a.fecha DESC;");
    }
    else{
        if($destino=='TODOS'){
            $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante FROM (SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo, ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta, ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section FROM oscorp_supply.ordenes WHERE ordenes.section='OFICINA' ) a LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id ORDER BY a.fecha DESC;");
        }
        else{
            $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante FROM (SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo, ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta, ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section FROM oscorp_supply.ordenes WHERE ordenes.section='OFICINA' AND ordenes.destino='".$destino."' ) a LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id ORDER BY a.fecha DESC;");
        }

    }

}
else{
    if($user_role=='SUPER ADMINISTRADOR'){
        if($destino=='NINGUNO'){
            $sentencia = $bd->prepare("SELECT * FROM oscorp_supply.ordenes WHERE ordenes.section='CASA';");
        }
        else{
            if($destino=='TODOS'){
                $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante FROM (SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.rebajado total_inicial, ordenes.fecha, ordenes.destino, ordenes.tipo, ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta, ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section FROM oscorp_supply.ordenes WHERE ordenes.section='OFICINA' ) a LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id ORDER BY a.fecha DESC;");
            }
            else{
                $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante FROM (SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.rebajado total_inicial, ordenes.fecha, ordenes.destino, ordenes.tipo, ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta, ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section FROM oscorp_supply.ordenes WHERE ordenes.section='OFICINA' AND ordenes.destino='".$destino."' ) a LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id ORDER BY a.fecha DESC;");
            }
        }
    }
    else{
        $sentencia = $bd->prepare("SELECT a.*, COALESCE(CONCAT(b.serie, '-', b.numero), 'SN') AS comprobante FROM (SELECT ordenes.id, ordenes.req_id, ordenes.numero, ordenes.ruc, ordenes.razon_social, ordenes.direccion, ordenes.subtotal, ordenes.igv, ordenes.total, ordenes.rebajado, ordenes.fecha, ordenes.destino, ordenes.tipo, ordenes.estado, ordenes.empresa, ordenes.moneda, ordenes.area, ordenes.destino_dir, ordenes.tipo_pago, ordenes.num_cuenta, ordenes.retencion, ordenes.retencion_percent, ordenes.percepcion, ordenes.receipt, ordenes.txt, ordenes.section FROM oscorp_supply.ordenes WHERE ordenes.section='OFICINA' AND ordenes.user_id=".$user_id." ) a LEFT JOIN oscorp_supply.fondoitems b ON a.id = b.orden_id ORDER BY a.fecha DESC;");
    }
}


//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$orders = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($orders);

?>
