async function followProduct(parent, args, context) {
  if (context.request.auth.isAuthenticated) {
    const { prisma } = context.request.server.app;
    const { userId } = context.request.auth.credentials;

    await prisma.product.create({
      data: {
        name: args.name,
        prices: {
          create: {
            price: args.price,
          },
        },
        retailer: {
          connectOrCreate: {
            where: { retailerUrl: args.retailer },
            create: { retailerUrl: args.retailer },
          },
        },
        currency: args.currency,
        productPageUrl: args.productPageUrl,
        productImageUrl: args.productImageUrl,
        followers: {
          connect: {
            id: Number(userId),
          },
        },
      },
    });

    const userQuery = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        products: {
          include: {
            prices: true,
            retailer: true,
          },
        },
      },
    });

    const { products } = userQuery;
    const user = ({ id, email, firstName, lastName } = userQuery);

    return {
      user,
      products,
    };
  }
}

async function unfollowProduct(parent, args, context) {
  if (context.request.auth.isAuthenticated) {
    const { prisma } = context.request.server.app;
    const { userId } = context.request.auth.credentials;

    await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        products: {
          disconnect: {
            id: Number(args.productId),
          },
        },
      },
    });

    const userQuery = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      include: {
        products: {
          include: {
            prices: true,
            retailer: true,
          },
        },
      },
    });

    const { products } = userQuery;
    const user = ({ id, email, firstName, lastName } = userQuery);

    return {
      user,
      products,
    };
  }
}

// updateProductInfo(productId: Int, price:Float):Product
async function updateProductInfo(parent, args, context) {
  await context.prisma.price.create({
    data: {
      price: args.price,
      product: {
        connect: {
          id: Number(args.productId),
        },
      },
    },
  });

  const updatedProduct = await context.prisma.product.findUnique({
    where: { id: Number(args.productId) },
    include: {
      prices: true,
      retailer: true,
    },
  });

  const {
    id,
    name,
    prices,
    currency,
    retailer,
    productImageUrl,
    productPageUrl,
  } = updatedProduct;

  return {
    id,
    name,
    prices,
    currency,
    retailer,
    productImageUrl,
    productPageUrl,
  };
}

// updateRetailerSelectors(retailerUrl:String!, productNameSelector:String, productPriceSelector:String, productCurrencySelector:String):Retailer
async function updateRetailerSelectors(parent, args, context) {
  const updatedRetailer = await context.prisma.retailer.update({
    where: { retailerUrl: args.retailerUrl },
    data: {
      productNameSelector: args.productNameSelector,
      productPriceSelector: args.productPriceSelector,
      productCurrencySelector: args.productCurrencySelector,
    },
  });

  console.log(updatedRetailer);

  return updatedRetailer;
}

module.exports = {
  followProduct,
  unfollowProduct,
  updateProductInfo,
  updateRetailerSelectors,
};
