import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { VendorsWithDebts } from "../../api/installment";

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
    {
      src: new URL("../../../public/fonts/calibri-italic.ttf", import.meta.url)
        .href,
      fontStyle: "italic",
    },
    {
      src: new URL(
        "../../../public/fonts/calibri-bold-italic.ttf",
        import.meta.url
      ).href,
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingLeft: 50,
    paddingRight: 50,
    fontFamily: "Calibri",
    fontSize: 11,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  date: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  vendor: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  customer: {
    fontSize: 12,
    marginLeft: 30,
    marginTop: 5,
    marginBottom: 2,
    fontWeight: "bold",
    color: "#34495E",
  },

  contractText: {
    fontSize: 11,
  },
  contractRow: {
    marginLeft: 40,
    marginBottom: 3,
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#BDC3C7",
    flexDirection: "row",
  },
  col1: {
    width: 150,
    textAlign: "left",
  },
  col2: {
    width: 100,
    textAlign: "left",
    marginHorizontal: "auto",
  },
  col3: {
    width: 100,
    textAlign: "right",
  },

  contractAmount: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#C0392B",
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
});

export function DebtsReportPDF({ vendors }: { vendors: VendorsWithDebts[] }) {
  const now = new Date().toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Reporte de Deudas por Vendedor</Text>
        <Text style={styles.date}>{now}</Text>

        {vendors.map((vendor) => (
          <View key={vendor.vendorId}>
            <Text style={styles.vendor}>
              T{vendor.code} {vendor.vendorName}
            </Text>

            {vendor.customers.map((customer) => (
              <View key={customer.customerId}>
                <Text style={styles.customer}>
                  Cliente: {customer.customerName}
                </Text>

                {customer.contracts.map((contract) => {
                  const { overdueNumbers } = contract;
                  const cuotasDisplay =
                    overdueNumbers.length > 3
                      ? `#${overdueNumbers[0]} … #${
                          overdueNumbers[overdueNumbers.length - 1]
                        }`
                      : overdueNumbers.map((n) => `#${n}`).join(", ");

                  return (
                    <View key={contract.contractId} style={styles.contractRow}>
                      <Text style={[styles.contractText, styles.col1]}>
                        Contrato: #{contract.contractCode}
                      </Text>

                      <Text style={[styles.contractText, styles.col2]}>
                        Cuotas: {contract.overdueInstallments}{" "}
                        <Text style={{ fontStyle: "italic", color: "#555" }}>
                          ({cuotasDisplay})
                        </Text>
                      </Text>

                      <Text style={[styles.contractAmount, styles.col3]}>
                        ${contract.overdueAmount}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Generado: {now}
        </Text>
      </Page>
    </Document>
  );
}
