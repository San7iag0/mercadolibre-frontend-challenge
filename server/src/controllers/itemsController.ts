import { Request, Response } from "express";
import fetch from "node-fetch";

export const getItems = async (req: Request, res: Response) => {
  const { q, offset = "0" } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Missing query param 'q'" });
  }

  try {
    const response = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${q}&offset=${offset}`);
    const data: any = await response.json();

    const categories =
      data.filters?.find((f: any) => f.id === "category")?.values[0]?.path_from_root.map((cat: any) => cat.name) || [];

    const items = data.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount: Math.floor(item.price),
        decimals: Math.round((item.price % 1) * 100),
        regular_amount: item.original_price || null,
      },
      picture: item.thumbnail,
      condition: item.condition,
      free_shipping: item.shipping.free_shipping,
      installments: item.installments
        ? `${item.installments.quantity} x ${item.installments.amount}`
        : null,
    }));

    res.json({ categories, items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getItemDetail = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const itemRes = await fetch(`https://api.mercadolibre.com/items/${id}`);
    const itemData: any = await itemRes.json();

    const descRes = await fetch(`https://api.mercadolibre.com/items/${id}/description`);
    const descData: any = await descRes.json();

    const categoryRes = await fetch(`https://api.mercadolibre.com/categories/${itemData.category_id}`);
    const categoryData: any = await categoryRes.json();

    const item = {
      id: itemData.id,
      title: itemData.title,
      price: {
        currency: itemData.currency_id,
        amount: Math.floor(itemData.price),
        decimals: Math.round((itemData.price % 1) * 100),
        regular_amount: itemData.original_price || null,
      },
      pictures: itemData.pictures.map((pic: any) => pic.url),
      condition: itemData.condition,
      free_shipping: itemData.shipping.free_shipping,
      sold_quantity: itemData.sold_quantity,
      installments: itemData.installments
        ? `${itemData.installments.quantity} x ${itemData.installments.amount}`
        : null,
      description: descData.plain_text,
      attributes: itemData.attributes.map((attr: any) => ({
        id: attr.id,
        name: attr.name,
        value_name: attr.value_name,
      })),
      category_path_from_root: categoryData.path_from_root.map((cat: any) => cat.name),
    };

    res.json({ item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

