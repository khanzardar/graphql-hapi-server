async function productsFollowedByUser(parent, args, context) {
  //console.log(context.request.auth);
  if (context.request.auth.isAuthenticated) {
    const { prisma } = context.request.server.app;
    const { userId } = context.request.auth.credentials;
    //console.log(`The userId is ${userId}`);

    // const userQuery = await prisma.user.findUnique({
    //   where: {
    //     id: Number(userId),
    //   },
    // });
    //console.log(userQuery);
    //return h.response({ userQuery }).code(200);
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

async function productPagesByRetailerAndRetailerSelectors(
  parent,
  args,
  context
) {
  // retailerUrl String @unique
  // productNameSelector String?
  // productPriceSelector String?
  // productCurrencySelector String?
  const brandQuery = await context.prisma.retailer.findUnique({
    where: {
      id: Number(args.id),
    },
  });

  const brand = ({
    id,
    retailerUrl,
    productNameSelector,
    productPriceSelector,
    productCurrencySelector,
  } = brandQuery);

  console.log(brand);

  const products = await context.prisma.product.findMany({
    where: { retailerId: id },
  });

  return {
    brand,
    products,
  };
}

module.exports = {
  productsFollowedByUser,
  productPagesByRetailerAndRetailerSelectors,
};
