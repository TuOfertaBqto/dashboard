import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  GlobalPaymentsTotals,
  VendorPaymentsTotals,
} from "../../api/contract-payment";
import { formatMoney } from "../../utils/formatMoney";

Font.register({
  family: "Calibri",
  fonts: [
    {
      src: new URL("../../../public/fonts/calibri-regular.ttf", import.meta.url)
        .href,
      fontWeight: "normal",
    },
    {
      src: new URL("../../../public/fonts/calibri-bold.ttf", import.meta.url)
        .href,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Calibri",
    fontSize: 11,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    paddingVertical: 3,
  },
  colName: {
    flex: 1.7,
    textAlign: "left",
    paddingRight: 18,
  },
  colAmount: {
    flex: 1,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    fontSize: 9,
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "grey",
  },
  bold: {
    fontWeight: "bold",
  },
});

export function VendorsTotalsPDF({
  vendors,
  totals,
}: {
  vendors: VendorPaymentsTotals[];
  totals: GlobalPaymentsTotals;
}) {
  const now = new Date().toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Resumen de Pagos por Vendedor</Text>
        <Text style={styles.date}>{now}</Text>

        <View style={styles.tableHeader}>
          <Text style={styles.colName}>Vendedor</Text>
          <Text style={styles.colAmount}>Cobrado</Text>
          <Text style={styles.colAmount}>Vencido</Text>
          <Text style={styles.colAmount}>Pendiente</Text>
          <Text style={styles.colAmount}>Total Deuda</Text>
        </View>

        {vendors.map((v) => (
          <View style={styles.tableRow} key={v.vendorId}>
            <Text style={styles.colName}>
              T{v.vendorCode} {v.firstName} {v.lastName}
            </Text>
            <Text style={styles.colAmount}>
              ${formatMoney(v.totalAmountPaid)}
            </Text>
            <Text style={styles.colAmount}>
              ${formatMoney(v.totalOverdueDebt)}
            </Text>
            <Text style={styles.colAmount}>
              ${formatMoney(v.totalPendingBalance)}
            </Text>
            <Text style={styles.colAmount}>${formatMoney(v.totalDebt)}</Text>
          </View>
        ))}

        <View style={[styles.tableRow, styles.bold]}>
          <Text style={styles.colName}>Totales</Text>
          <Text style={styles.colAmount}>
            ${formatMoney(totals.totalAmountPaid)}
          </Text>
          <Text style={styles.colAmount}>
            ${formatMoney(totals.totalOverdueDebt)}
          </Text>
          <Text style={styles.colAmount}>
            ${formatMoney(totals.totalPendingBalance)}
          </Text>
          <Text style={styles.colAmount}>${formatMoney(totals.totalDebt)}</Text>
        </View>

        <Text style={styles.footer} fixed>
          Generado: {now}
        </Text>
      </Page>
    </Document>
  );
}
