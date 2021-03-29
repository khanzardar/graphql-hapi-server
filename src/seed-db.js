//Only for testing purposes and for seeding database
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "k.zardar@gmail.com",
      firstName: "Zardar",
      lastName: "Khan",
      products: {
        create: {
          name: "KIDS GRIZZLY BOMBER JACKET",
          prices: {
            create: {
              price: 495.0,
            },
          },
          retailer: {
            connectOrCreate: {
              where: { retailerUrl: "www.canadagoose.com" },
              create: { retailerUrl: "www.canadagoose.com" },
            },
          },
          currency: "CAD",
          productPageUrl:
            "https://www.canadagoose.com/ca/en/kids-grizzly-bomber-jacket-7995K.html#start=1&cgid=shop-kids-kids-outerwear",
          productImageUrl:
            "https://images.canadagoose.com/image/upload/w_480,c_scale,f_auto,q_auto:best/v1601390546/product-image/7995K_207.jpg",
        },
      },
    },
  });
  //add a new product to our existing user with email = k.zardar@gmail.com
  await prisma.product.create({
    data: {
      name: "CHILLIWACK BOMBER JACKET WITH HOOD TRIM",
      prices: {
        create: {
          price: 795.0,
        },
      },
      retailer: {
        connectOrCreate: {
          where: { retailerUrl: "www.canadagoose.com" },
          create: { retailerUrl: "www.canadagoose.com" },
        },
      },
      currency: "CAD",
      productPageUrl:
        "https://www.canadagoose.com/ca/en/chilliwack-bomber-jacket-with-hood-trim-7999MT.html#start=1&cgid=shop-mens-bombers",
      productImageUrl:
        "https://images.canadagoose.com/image/upload/w_480,c_scale,f_auto,q_auto:best/v1605629687/product-image/7999MT_61.jpg",
      followers: { connect: { email: "k.zardar@gmail.com" } },
    },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
