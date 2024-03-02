// Chakra imports
import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
// Assets
import BackgroundCard1 from "assets/img/BackgroundCard1.png";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import IconBox from "components/Icons/IconBox";
import { HSeparator } from "components/Separator/Separator";
import InvoicesRow from "components/Tables/InvoicesRow";
import React from "react";
import { FaCalculator, FaClock } from "react-icons/fa";
import { RiRobot2Fill } from "react-icons/ri";
import { invoicesData } from "variables/general";

function Dashboard() {
  // Chakra color mode
  const iconBlue = useColorModeValue("blue.500", "blue.500");
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("#dee2e6", "transparent");
  const { colorMode } = useColorMode();

  return (
    <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
      <Grid templateColumns={{ sm: "1fr", lg: "2fr 1.2fr" }} templateRows="1fr">
        <Box>
          <Grid
            templateColumns={{
              sm: "1fr",
              md: "1fr 1fr",
              xl: "1fr 1fr 1fr 1fr",
            }}
            templateRows={{ sm: "auto auto auto", md: "1fr auto", xl: "1fr" }}
            gap="26px"
          >
            <Card
              backgroundImage={
                colorMode === "dark"
                  ? "linear-gradient(180deg, #3182CE 0%, #63B3ED 100%)"
                  : BackgroundCard1
              }
              backgroundRepeat="no-repeat"
              background="cover"
              bgPosition="10%"
              p="16px"
              h={{ sm: "220px", xl: "100%" }}
              gridArea={{ md: "1 / 1 / 2 / 3", xl: "1 / 1 / 2 / 3" }}
            >
              <CardBody h="100%" w="100%">
                <Flex
                  direction="column"
                  color="white"
                  h="100%"
                  p="0px 10px 20px 10px"
                  w="100%"
                >
                  <Flex justify="space-between" align="left">
                    <Text fontSize="md" fontWeight="bold">
                      AI Bots
                    </Text>
                    <Icon
                      as={RiRobot2Fill}
                      w="48px"
                      h="auto"
                      color="gray.400"
                    />
                  </Flex>
                  <Flex direction="column" justify="space-between">
                    <Box style={{ marginLeft: "15px" }}>
                      <ol>
                        <li>
                          <Text>Space Pirate</Text>
                        </li>
                        <li>
                          <Text>Code Bot</Text>
                        </li>
                      </ol>
                    </Box>
                  </Flex>
                </Flex>
              </CardBody>
            </Card>
            <Card p="16px" display="flex" align="center" justify="center">
              <CardBody>
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  w="100%"
                  py="14px"
                >
                  <IconBox as="box" h={"60px"} w={"60px"} bg={iconBlue}>
                    <Icon h={"24px"} w={"24px"} color="white" as={FaClock} />
                  </IconBox>
                  <Flex
                    direction="column"
                    m="14px"
                    justify="center"
                    textAlign="center"
                    align="center"
                    w="100%"
                  >
                    <Text fontSize="md" color={textColor} fontWeight="bold">
                      Date
                    </Text>
                    <Text
                      mb="24px"
                      fontSize="xs"
                      color="gray.400"
                      fontWeight="semibold"
                    >
                      {
                        [
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ][new Date().getDay()]
                      }
                    </Text>
                    <HSeparator />
                  </Flex>
                  <Text fontSize="lg" color={textColor} fontWeight="bold">
                    {new Date().toLocaleDateString()}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
            <Card p="16px" display="flex" align="center" justify="center">
              <CardBody>
                <Flex direction="column" align="center" w="100%" py="14px">
                  <IconBox as="box" h={"60px"} w={"60px"} bg={iconBlue}>
                    <Icon
                      h={"24px"}
                      w={"24px"}
                      color="white"
                      as={FaCalculator}
                    />
                  </IconBox>
                  <Flex
                    direction="column"
                    m="14px"
                    justify="center"
                    textAlign="center"
                    align="center"
                    w="100%"
                  >
                    <Text fontSize="md" color={textColor} fontWeight="bold">
                      Total
                    </Text>
                    <Text
                      mb="24px"
                      fontSize="xs"
                      color="gray.400"
                      fontWeight="semibold"
                    >
                      Saved Passwords
                    </Text>
                    <HSeparator />
                  </Flex>
                  <Text fontSize="lg" color={textColor} fontWeight="bold">
                    60
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          </Grid>
          {/* <Card p="16px" mt="24px">
            <CardHeader>
              <Flex
                justify="space-between"
                align="center"
                minHeight="60px"
                w="100%"
              >
                <Text fontSize="lg" color={textColor} fontWeight="bold">
                  Navigation
                </Text>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex
                direction={{ sm: "column", md: "row" }}
                align="center"
                w="100%"
                justify="center"
                py="1rem"
              >
                <Flex
                  p="1rem"
                  bg={colorMode === "dark" ? "navy.900" : "transparent"}
                  borderRadius="15px"
                  width="100%"
                  border="1px solid"
                  borderColor={borderColor}
                  align="center"
                  mb={{ sm: "24px", md: "0px" }}
                  me={{ sm: "0px", md: "24px" }}
                >
                  <IconBox me="10px" w="25px" h="22px">
                    <MastercardIcon w="100%" h="100%" />
                  </IconBox>
                  <Text color="gray.400" fontSize="md" fontWeight="semibold">
                    7812 2139 0823 XXXX
                  </Text>
                  <Spacer />
                  <Button p="0px" w="16px" h="16px" variant="no-effects">
                    <Icon
                      as={FaPencilAlt}
                      color={colorMode === "dark" && "white"}
                    />
                  </Button>
                </Flex>
                <Flex
                  p="16px"
                  bg={colorMode === "dark" ? "navy.900" : "transparent"}
                  borderRadius="15px"
                  width="100%"
                  border="1px solid"
                  borderColor={borderColor}
                  align="center"
                >
                  <IconBox me="10px" w="25px" h="25px">
                    <VisaIcon w="100%" h="100%" />
                  </IconBox>
                  <Text color="gray.400" fontSize="md" fontWeight="semibold">
                    7812 2139 0823 XXXX
                  </Text>
                  <Spacer />
                  <Button
                    p="0px"
                    bg="transparent"
                    w="16px"
                    h="16px"
                    variant="no-effects"
                  >
                    <Icon
                      as={FaPencilAlt}
                      color={colorMode === "dark" && "white"}
                    />
                  </Button>
                </Flex>
              </Flex>
            </CardBody>
          </Card> */}
        </Box>
        {/* <Card
          p="22px"
          my={{ sm: "24px", lg: "0px" }}
          ms={{ sm: "0px", lg: "24px" }}
        >
          <CardHeader>
            <Flex justify="space-between" align="center" mb="1rem" w="100%">
              <Text fontSize="lg" color={textColor} fontWeight="bold">
                Invoices
              </Text>
              <Button
                variant="outlined"
                color={colorMode === "dark" && "white"}
                borderColor={colorMode === "dark" && "white"}
                _hover={colorMode === "dark" && "none"}
                minW="110px"
                maxH="35px"
              >
                VIEW ALL
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex direction="column" w="100%">
              {invoicesData.map((row, idx) => {
                return (
                  <InvoicesRow
                    date={row.date}
                    code={row.code}
                    price={row.price}
                    logo={row.logo}
                    format={row.format}
                    key={idx}
                  />
                );
              })}
            </Flex>
          </CardBody>
        </Card> */}
      </Grid>
    </Flex>
  );
}

export default Dashboard;
