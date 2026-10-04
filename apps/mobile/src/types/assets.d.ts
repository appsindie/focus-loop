// Metro resolves these to numeric asset module ids at bundle time; expo-audio's
// createAudioPlayer accepts that number as its source.
declare module "*.wav" {
  const asset: number;
  export default asset;
}
