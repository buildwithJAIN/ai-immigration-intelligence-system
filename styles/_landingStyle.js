import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  video: {
  width: width * 1.5,
  height: height * 0.9,
  borderRadius: 40,
//   transform: [{ translateY: -50 }],  // 👈 same effect but smoother
  transform: [{ translateX: -100 }],  // 👈 same effect but smoother
},

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)", // soft dark overlay for text visibility
  },
  content: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
  },
  continueButton: {
    // backgroundColor: "#0b316b", // your themed blue
    paddingVertical: 120,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  continueText: {
    color: "#0b316b",
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
