from fastapi import APIRouter, Depends, Query
from schemas import (
    CartItem,
    CreateOrderRequest,
    Order,
    OrderDetail,
    OrderProduct,
    ProductItem,
    ProductPrice,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/market", tags=["market"])

PAGE_SIZE = 10  

def _adapt_product(e: dict) -> ProductItem:
    prices = {p["point_type_id"]: p["points_sum"] for p in e.get("prices", [])}
    return ProductItem(
        id=e["id"],
        title=e["title"].strip(),
        description=e.get("description", ""),
        quantity=e["quantity"],
        image_url=e.get("url") or e.get("file_name", ""),
        price=ProductPrice(diamonds=prices.get(1, 0), coins=prices.get(2, 0)),
    )


def _adapt_order_product(e: dict) -> OrderProduct:
    prices = {p["point_type_id"]: p["points_sum"] for p in e.get("prices", [])}
    return OrderProduct(
        id=e["id"],
        title=e["title"],
        quantity=e["quantity"],
        image_url=e.get("url") or e.get("file_name", ""),
        price=ProductPrice(diamonds=prices.get(1, 0), coins=prices.get(2, 0)),
    )


@router.get("/products", response_model=list[ProductItem])
async def get_products(
    page: int = Query(1, ge=1),
    type: int = Query(0, ge=0),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Список товаров в магазине."""
    data = await client.get("/market/customer/product/list", params={"page": page, "type": type})
    products = data.get("products_list", data) if isinstance(data, dict) else data
    return [_adapt_product(e) for e in products]


@router.get("/products/all", response_model=list[ProductItem])
async def get_all_products(
    type: int = Query(0, ge=0),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Все товары — автопагинация по total_count."""
    results = []
    page = 1
    while True:
        data = await client.get("/market/customer/product/list", params={"page": page, "type": type})
        products = data.get("products_list", []) if isinstance(data, dict) else data
        total = data.get("total_count", 0) if isinstance(data, dict) else 0

        results.extend([_adapt_product(e) for e in products])

        if len(results) >= total or not products:
            break
        page += 1

    return results


@router.post("/cart", response_model=list[ProductItem])
async def get_cart(
    items: list[CartItem],
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Получить товары из корзины."""
    data = await client.post("/market/customer/product/restore-cart-products-list", json={
        "cart_items": [{"id": i.id, "count": i.count} for i in items]
    })
    products = data if isinstance(data, list) else data.get("products_list", [])
    return [_adapt_product(e) for e in products]


@router.get("/orders", response_model=list[Order])
async def get_orders(
    page: int = Query(0, ge=0),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """История заказов."""
    data = await client.get("/market/customer/order/list", params={"page": page})
    orders = data.get("orders_list", []) if isinstance(data, dict) else data
    return [Order(id=e["id"], created_at=e["created_at"], status=e["status"]) for e in orders]


@router.post("/orders/create", response_model=Order)
async def create_order(
    body: CreateOrderRequest,
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Создать заказ из корзины."""
    data = await client.post("/market/customer/order/create", json={
        "cart": {
            "notes": body.notes,
            "cart_items": [{"id": i.id, "count": i.count} for i in body.items],
        }
    })
    return Order(id=data["id"], created_at=data["created_at"], status=data["status"])

@router.get("/orders/{order_id}", response_model=OrderDetail)
async def get_order(
    order_id: int,
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Детали заказа."""
    data = await client.get("/market/customer/order/info", params={"id": order_id})
    return OrderDetail(
        id=data["id"],
        created_at=data["created_at"],
        updated_at=data["updated_at"],
        status=data["status"],
        notes=data.get("notes"),
        products=[_adapt_order_product(e) for e in data.get("products_list", [])],
    )