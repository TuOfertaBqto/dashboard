import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ContractApi,
  type Contract,
  type CreateContract,
} from "../api/contract";
import { ContractForm } from "../components/ContractForm";
import { userApi, type User } from "../api/user";
import { ProductApi, type Product } from "../api/product";
import { InventoryApi } from "../api/inventory";
import { InventoryMovApi } from "../api/inventory-movement";
import { ContractPaymentApi } from "../api/contract-payment";

export default function ContractFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [vendors, setVendors] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendorRes, customerRes, productRes] = await Promise.all([
          userApi.getAll("vendor"),
          userApi.getAll("customer"),
          ProductApi.getAll(),
        ]);

        setVendors(vendorRes);
        setCustomers(customerRes);
        setProducts(productRes);

        if (id) {
          const contractRes = await ContractApi.getById(id);
          setContract(contractRes);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (data: CreateContract) => {
    let contractToDispatch: Contract | null = null;
    try {
      if (id) {
        const {
          agreement,
          requestDate,
          totalPrice,
          customerId,
          vendorId,
          //endDate,
          //startDate,
        } = data;

        await ContractApi.update(id, {
          agreement,
          requestDate,
          totalPrice,
          customerId,
          vendorId,
          //endDate,
          //startDate,
        });
      } else {
        await Promise.all(
          data.products.map(async (p) => {
            const toDesp = await ContractApi.getToDispatchQuantity(p.productId);
            const stock = await InventoryApi.getStockByProductId(p.productId);

            const isAvailable = stock >= p.quantity + toDesp;
            p.status = isAvailable ? "to_dispatch" : "to_buy";
          })
        );

        contractToDispatch = await ContractApi.create(data);
      }

      if (data.startDate && contractToDispatch) {
        for (const p of contractToDispatch.products) {
          if (p.status === "to_buy") {
            await InventoryMovApi.create({
              productId: p.product.id,
              quantity: p.quantity,
              type: "in",
            });
          }

          await InventoryMovApi.create({
            productId: p.product.id,
            quantity: p.quantity,
            type: "out",
          });

          await ContractApi.updateProducts(p.id, "dispatched");
        }

        await ContractPaymentApi.create({
          contractId: contractToDispatch.id,
          agreementContract: contractToDispatch.agreement,
          startContract: contractToDispatch.startDate.split("T")[0],
          products: contractToDispatch.products.map((p) => ({
            price: p.product.price,
            installmentAmount: p.product.installmentAmount,
            quantity: p.quantity,
          })),
        });
      }

      navigate("/contracts");
    } catch (err) {
      console.error("Error guardando contrato", err);
    }
  };

  if (loading) return <p className="p-4">Cargando...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-6">
        {id ? `Editar contrato C#${contract?.code}` : "Crear contrato"}
      </h1>
      <ContractForm
        initialData={contract}
        onSubmit={handleSubmit}
        vendors={vendors}
        customers={customers}
        products={products}
      />
    </div>
  );
}
