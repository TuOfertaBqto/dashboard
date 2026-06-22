import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import type { Contract } from "../../api/contract";
import type { Installment } from "../../api/installment";
import {
  formatDateToText,
  translatePaymentMethod,
} from "../../utils/translations";
import { numeroALetras } from "../../utils/numero-a-letras";
const styles = StyleSheet.create({
  page: {
    fontFamily: "Calibri",
    fontSize: 11,
    paddingTop: 71,
    paddingBottom: 71,
    paddingLeft: 70,
    paddingRight: 70,
    textAlign: "justify",
  },
  section: { marginBottom: 10 },
  table: {
    width: "auto",
    maxHeight: 490,
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginLeft: 30,
    marginRight: 30,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  header: {
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 400,
    objectFit: "contain",
  },
  tableInfo: {
    width: "auto",
    maxHeight: 490,
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  tableCol1: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableCol2: {
    width: "70%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
});

interface Props {
  contract: Contract;
  installments: Installment[];
}

const SIGNATURE_VENDOR = import.meta.env.VITE_SIGNATURE_VENDOR;

export const FinalizedContractPDF = ({ contract, installments }: Props) => {
  const name = contract.customerId.firstName.trim().toUpperCase();
  const lastName = contract.customerId.lastName.trim().toUpperCase();
  const documentId = contract.customerId.documentId;
  const endDate = contract.endDate.split("T")[0];
  const description = contract.products.map(
    (p) => `(${p.quantity}) ${p.product.name}`,
  ) || ["Sin productos"];
  const totalPrice = contract.totalPrice;
  const totalPriceText = numeroALetras(totalPrice);

  const debt = Math.min(
    ...installments
      .map((c) => (c.debt == null ? NaN : Number(c.debt)))
      .filter((d) => !isNaN(d)),
  );

  // function calcularPromedioDias(installments: Installment[]) {
  //   const diferencias = installments
  //     .map((i) => {
  //       if (!i.installmentPayments?.length) return null;

  //       const due = dayjs(i.dueDate);
  //       const paid = dayjs(i.paidAt);

  //       return paid.diff(due, "day"); // positivo = tarde, negativo = adelantado
  //     })
  //     .filter((d) => d !== null) as number[];

  //   if (diferencias.length === 0) return 0;

  //   const suma = diferencias.reduce((a, b) => a + b, 0);
  //   return Math.round(suma / diferencias.length);
  // }

  // function clasificarCliente(promedioDias: number) {
  //   if (promedioDias <= 0) return "EXCELENTE";
  //   if (promedioDias <= 5) return "BUENO";
  //   return "DEFICIENTE";
  // }

  const numberInstallmentsText = numeroALetras(installments.length);
  const agreement =
    contract.agreement === "weekly" ? "semanales" : "quincenales";

  // const promedio = calcularPromedioDias(installments);
  // const clasificacion = clasificarCliente(promedio);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{ textAlign: "center", fontWeight: "bold", marginBottom: 15 }}
        >
          <Text
            style={{
              fontSize: 14,
            }}
          >
            FINIQUITO Y NOTA DE ENTREGA FORMAL
          </Text>
          <Text
            style={{
              fontSize: 12,
            }}
          >
            TRANSFERENCIA DE DOMINIO Y CANCELACIÓN DE CONTRATO
          </Text>
        </View>

        <Text style={{ marginBottom: 12 }}>
          En la ciudad de Barquisimeto, Estado Lara, República Bolivariana de
          Venezuela, {formatDateToText(endDate, true)}, comparecen ante este
          acto el Ciudadano
        </Text>

        <View>
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            I. IDENTIFICACIÓN DE LAS PARTES
          </Text>

          <View style={styles.tableInfo}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Nombre:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>EIVAR PÉREZ</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Cédula:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>V-20.010.478</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Teléfono/Contacto:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>+58 424 536 38 86</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Correo electrónico:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>eivarperezbox@gmail.com</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Carácter:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>Vendedor</Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            II. REFERENCIA AL CONTRATO INICIAL
          </Text>

          <View style={styles.tableInfo}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>
                  Bien Materia del Contrato:
                </Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>{description.join("\n")}</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>
                  Precio Total Pactado:
                </Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>USD ${totalPrice}</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Número de Cuotas:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>
                  {numberInstallmentsText} ({installments.length}) cuotas{" "}
                  {agreement}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Garantía:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>Seis (6) meses por defectos de fábrica</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <View>
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              III. DECLARACIÓN DE FINIQUITO Y CANCELACIÓN
            </Text>
            <Text>Las partes comparecientes declaran solemnemente que:</Text>
          </View>
          <View style={{ gap: 5 }}>
            <Text>
              1. EL CLIENTE ha cancelado íntegramente la totalidad del precio
              pactado en el Contrato de Compraventa a Crédito con Reserva de
              Dominio, consistente en la cantidad de USD ${totalPrice} (
              {totalPriceText} Dólares Americanos), conforme al calendario de
              pagos establecido en el instrumento original.
            </Text>
            <Text>
              2. EL VENDEDOR reconoce y declara haber recibido la totalidad de
              los pagos en la forma, oportunidad y moneda convenidas, quedando
              completamente SALDADA la deuda derivada del contrato de
              compraventa.
            </Text>
            <Text>
              3. Se han cancelado todas y cada una de las{" "}
              {numberInstallmentsText} ({installments.length}) cuotas{" "}
              {agreement} establecidas en el calendario de pagos, sin que reste
              monto alguno adeudado.
            </Text>
            <Text>
              4. Como consecuencia de la cancelación total del precio, EL
              VENDEDOR libera al CLIENTE de toda obligación de pago, renuncia
              expresamente a cualquier derecho de recuperación del bien, y
              procede a la transferencia definitiva de la propiedad, dominio y
              titularidad del bien descrito en el presente acto.
            </Text>
          </View>
        </View>

        <View style={{ gap: 8, marginTop: 12 }}>
          <View>
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              IV. TRANSFERENCIA DE DOMINIO Y PROPIEDAD
            </Text>
            <Text>
              En virtud de lo anterior y en cumplimiento de lo establecido en el
              artículo 1.534 del Código Civil Venezolano y la Ley sobre Ventas
              con Reserva de Dominio, EL VENDEDOR, por este acto, TRANSFIERE
              DEFINITIVAMENTE a EL CLIENTE:
            </Text>
          </View>
          <View style={{ gap: 5 }}>
            <Text>
              • La propiedad plena del bien mueble descrito.{`\n`}• El dominio y
              control total sobre: {description.join(", ")} de referencia.{`\n`}
              • La titularidad absoluta para disponer del bien sin restricción
              alguna.{`\n`}• El derecho de enajenar, gravar, ceder o transferir
              el bien a terceros sin limitación de ninguna clase.
            </Text>
            <Text>
              A partir de la fecha de este documento, EL CLIENTE es el legítimo
              propietario del bien y puede ejercer todos los derechos que le
              corresponden como tal, sin que subsista gravamen, carga,
              limitación o reserva de dominio alguna.
            </Text>
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={{ gap: 8 }}>
          <View>
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              V. NOTA DE ENTREGA FORMAL
            </Text>
            <Text>Se constancia por este medio que:</Text>
          </View>
          <View style={{ gap: 5 }}>
            <Text>
              1. EL VENDEDOR ha entregado físicamente a EL CLIENTE{" "}
              {description.join(", ")} objeto de este contrato, en buen estado
              de funcionamiento y sin deterioro alguno, salvo el que resulte del
              uso normal conforme a las condiciones del contrato original.
            </Text>
            <Text>
              2. EL CLIENTE recibe el bien con conformidad, sin salvedad ni
              observación alguna.
            </Text>
            <Text>
              3. El bien ha sido inspeccionado por EL CLIENTE y se encuentra en
              las condiciones descritas en el Contrato de Compraventa a Crédito
              suscrito con fecha anterior.
            </Text>
            <Text>
              4. No existen daños adicionales, faltantes o desperfectos no
              atribuibles al uso ordinario de la máquina.
            </Text>
            <Text>
              5. La garantía de seis (6) meses por defectos de fabricación,
              contada desde la fecha de entrega inicial del bien, se mantiene
              vigente conforme a lo establecido en el contrato original. Esta
              garantía ampara defectos de fabricación, y no cubre daños por mal
              uso, negligencia, siniestros o accidentes.
            </Text>
          </View>
        </View>
        <View style={{ gap: 8, marginTop: 12 }}>
          <View>
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              VI. LIBERACIÓN DE RESPONSABILIDADES
            </Text>
            <Text>
              A partir de la entrega del bien y la firma de este finiquito:
            </Text>
          </View>
          <View style={{ gap: 5 }}>
            <Text>
              1. EL VENDEDOR renuncia expresamente a todos los derechos que le
              conferían la reserva de dominio, quedando liberado de toda
              responsabilidad respecto al bien.
            </Text>
            <Text>
              2. EL VENDEDOR no será responsable por daños, deterioro, pérdida o
              destrucción del bien que ocurra después de la firma de este
              documento.
            </Text>
            <Text>
              3. EL CLIENTE asume plena responsabilidad sobre el bien desde la
              firma de este acto.
            </Text>
            <Text>
              4. Las partes declaran no tener pendiente obligación alguna
              derivada del Contrato de Compraventa a Crédito con Reserva de
              Dominio, excepto por las garantías expresamente pactadas.
            </Text>
          </View>
        </View>
        <View style={{ gap: 5, marginTop: 12 }}>
          <View>
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              VII. ACLARACIÓN FINAL
            </Text>
            <Text>
              Las partes declaran que este documento constituye la finalización
              legal y efectiva del Contrato de Compraventa a Crédito con Reserva
              de Dominio suscrito con anterioridad, quedando completamente
              ejecutado y cumplido en todos sus términos. EL CLIENTE es a partir
              de ahora el único y exclusivo propietario del bien, con facultad
              para disponer del mismo sin limitación alguna.
            </Text>
          </View>
          <Text>
            Este finiquito y nota de entrega formal tiene validez legal y puede
            ser utilizado como comprobante de transferencia de propiedad y
            cancelación total de la deuda ante cualquier autoridad competente.
          </Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <View>
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              VIII. SUSCRIPCIÓN Y ACEPTACIÓN
            </Text>
            <Text>
              En señal de aceptación y conformidad con lo anteriormente
              expresado, las partes suscriben este documento en la fecha
              indicada al inicio del mismo.
            </Text>
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.header]}>
            <Text style={[styles.tableCol, { width: "10%" }]}>CUOTA</Text>

            <Text
              style={[styles.tableCol, { width: "20%", textAlign: "center" }]}
            >
              FECHA CUOTA
            </Text>

            <Text
              style={[styles.tableCol, { width: "20%", textAlign: "center" }]}
            >
              FECHA PAGO
            </Text>

            <Text
              style={[styles.tableCol, { width: "15%", textAlign: "center" }]}
            >
              MONTO
            </Text>

            <Text
              style={[styles.tableCol, { width: "20%", textAlign: "center" }]}
            >
              TIPO
            </Text>

            <Text
              style={[styles.tableCol, { width: "15%", textAlign: "center" }]}
            >
              SALDO
            </Text>
          </View>

          {installments.map((cuota, index) => {
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={[styles.tableCol, { width: "10%" }]}>
                  #{index + 1}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    { width: "20%", textAlign: "center" },
                  ]}
                >
                  {dayjs(cuota.dueDate.split("T")[0]).format("DD-MM-YYYY")}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    { width: "20%", textAlign: "center" },
                  ]}
                >
                  {dayjs(cuota.paidAt!.split("T")[0]).format("DD-MM-YYYY")}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    { width: "15%", textAlign: "center" },
                  ]}
                >
                  ${cuota.installmentAmount}
                </Text>
                <Text
                  style={[styles.tableCol, { width: "20%", textAlign: "left" }]}
                >
                  {cuota.installmentPayments?.length > 0
                    ? translatePaymentMethod(
                        cuota.installmentPayments[0].payment.type ?? "",
                      )
                    : ""}
                </Text>
                <Text style={[styles.tableCol, { width: "15%" }]}>
                  {cuota.debt ? "$" + cuota.debt : ""}
                </Text>
              </View>
            );
          })}
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableCol,
                {
                  width: "50%",
                },
              ]}
            ></View>
            <View
              style={[
                styles.tableCol,
                {
                  width: "50%",
                  fontWeight: "bold",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingLeft: 55,
                },
              ]}
            >
              <View>
                <Text>TOTAL DEUDA:</Text>
              </View>
              <View>
                <Text>${debt}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FIRMA */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 50,
            marginHorizontal: 20,
          }}
        >
          <View
            style={{ width: "45%", alignItems: "center", position: "relative" }}
          >
            <Text
              style={{
                position: "absolute",
                left: 0,
                top: 0,
              }}
            >
              Firma:
            </Text>

            <View
              style={{
                height: 60,
                justifyContent: "flex-end",
                marginBottom: 5,
                width: "100%",
                alignItems: "center",
              }}
            >
              {SIGNATURE_VENDOR && (
                <Image
                  src={SIGNATURE_VENDOR}
                  style={{ width: 150, height: "auto", marginBottom: -10 }}
                />
              )}
            </View>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "black",
                borderBottomStyle: "solid",
                width: "85%",
                marginBottom: 8,
              }}
            />

            <View
              style={{
                alignItems: "center",
              }}
            >
              <Text>Eivar Perez</Text>
              <Text>C.I.: V-20.010.478</Text>
              <Text>Fecha: {dayjs(endDate).format("DD/MM/YYYY")}</Text>
              <Text
                style={{
                  fontWeight: "bold",
                  marginTop: 4,
                }}
              >
                “EL VENDEDOR”
              </Text>
            </View>
          </View>

          <View
            style={{ width: "45%", alignItems: "center", position: "relative" }}
          >
            <Text
              style={{
                position: "absolute",
                left: 0,
                top: 0,
              }}
            >
              Firma:
            </Text>

            <View
              style={{
                height: 60,
                justifyContent: "flex-end",
                marginBottom: 5,
                width: "100%",
                alignItems: "center",
              }}
            ></View>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "black",
                borderBottomStyle: "solid",
                width: "85%",
                marginBottom: 8,
              }}
            />

            <View style={{ alignItems: "center" }}>
              <Text>
                {name.split(" ")[0]} {lastName.split(" ")[0]}
              </Text>
              <Text>C.I.: V-{documentId}</Text>
              <Text>Fecha:__________</Text>
              <Text
                style={{
                  fontWeight: "bold",
                  marginTop: 4,
                }}
              >
                “EL CLIENTE”
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
