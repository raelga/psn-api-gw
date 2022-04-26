import { getTitleTrophyGroups, Trophy } from "psn-api";
import {
  exchangeCodeForAccessToken,
  exchangeNpssoForCode,
  getTitleTrophies,
  getUserTitles,
  getProfileFromUserName,
  getUserTrophiesEarnedForTitle,
  makeUniversalSearch,
  TrophyRarity
} from "psn-api";

const DEFAULT_LANGUAGE: string = String(process.env.PSN_NPSSO) || "en-us";

const NPSSO: string = String(process.env.PSN_NPSSO);

const mergeTrophyLists = (
  titleTrophies: Trophy[],
  earnedTrophies: Trophy[]
) => {
  const mergedTrophies: any[] = [];

  for (const earnedTrophy of earnedTrophies) {
    const foundTitleTrophy = titleTrophies.find(
      (t) => t.trophyId === earnedTrophy.trophyId
    );

    mergedTrophies.push(
      normalizeTrophy({ ...earnedTrophy, ...foundTitleTrophy })
    );
  }

  return mergedTrophies;
};

const normalizeTrophy = (trophy: Trophy) => {
  return {
    isEarned: trophy.earned ?? false,
    earnedOn: trophy.earned ? trophy.earnedDateTime : "unearned",
    type: trophy.trophyType,
    rarity: rarityMap[trophy.trophyRare ?? 0],
    earnedRate: Number(trophy.trophyEarnedRate),
    trophyName: trophy.trophyName,
    groupId: trophy.trophyGroupId
  };
};

const rarityMap: Record<TrophyRarity, string> = {
  [TrophyRarity.VeryRare]: "Very Rare",
  [TrophyRarity.UltraRare]: "Ultra Rare",
  [TrophyRarity.Rare]: "Rare",
  [TrophyRarity.Common]: "Common"
};



const FetchUserProfile = async (username: string) => {

  // 1. Authenticate and become authorized with PSN.
  const accessCode = await exchangeNpssoForCode(NPSSO);
  const authorization = await exchangeCodeForAccessToken(accessCode);

  const profile = getProfileFromUserName(authorization, username);

  return profile
};


const FetchUserGames = async (username: string) => {

  // 1. Authenticate and become authorized with PSN.
  const accessCode = await exchangeNpssoForCode(NPSSO);
  const authorization = await exchangeCodeForAccessToken(accessCode);

  const allAccountsSearchResults = await makeUniversalSearch(
    authorization,
    username,
    "SocialAllAccounts"
  );

  const targetAccountId = allAccountsSearchResults.domainResponses[0].results[0].socialMetadata.accountId;

  const { trophyTitles } = await getUserTitles(authorization, targetAccountId);

  return trophyTitles

};

const FetchUserTrophies = async (username: string) => {

  // 1. Authenticate and become authorized with PSN.
  const accessCode = await exchangeNpssoForCode(NPSSO);
  const authorization = await exchangeCodeForAccessToken(accessCode);

  // 2. Get the user's `accountId` from the username.
  const allAccountsSearchResults = await makeUniversalSearch(
    authorization,
    username,
    "SocialAllAccounts"
  );

  const targetAccountId = allAccountsSearchResults.domainResponses[0].results[0].socialMetadata.accountId;

  // 3. Get the user's list of titles (games).
  const { trophyTitles } = await getUserTitles(authorization, targetAccountId);

  const games: any[] = [];
  for (const title of trophyTitles) {
    // 4. Get the list of trophies for each of the user's titles.
    const { trophies: titleTrophies } = await getTitleTrophies(
      authorization,
      title.npCommunicationId,
      "all",
      {
        npServiceName:
          title.trophyTitlePlatform !== "PS5" ? "trophy" : undefined
      }
    );

    // 5. Get the list of _earned_ trophies for each of the user's titles.
    const { trophies: earnedTrophies } = await getUserTrophiesEarnedForTitle(
      authorization,
      targetAccountId,
      title.npCommunicationId,
      "all",
      {
        npServiceName:
          title.trophyTitlePlatform !== "PS5" ? "trophy" : undefined
      }
    );

    // 6. Merge the two trophy lists.
    const mergedTrophies = mergeTrophyLists(titleTrophies, earnedTrophies);

    games.push({
      gameName: title.trophyTitleName,
      platform: title.trophyTitlePlatform,
      trophyTypeCounts: title.definedTrophies,
      earnedCounts: title.earnedTrophies,
      trophyList: mergedTrophies
    });
  }

  // 7. Write to a JSON file.
  return games;
}

const getNpServiceName = async (game: string): Promise<"trophy" | "trophy2"> => {
  // 1. Authenticate and become authorized with PSN.
  const accessCode = await exchangeNpssoForCode(NPSSO);
  const authorization = await exchangeCodeForAccessToken(accessCode);
  try {
    const titleTrophyGroups = await getTitleTrophyGroups(
      authorization,
      game,
      {
        npServiceName: "trophy",
      }
    );
  } catch (error) {
    return "trophy2"
  }
  return "trophy"
}

const FetchGameTrophyGroups = async (game: string, lang: string = DEFAULT_LANGUAGE) => {
  // 1. Authenticate and become authorized with PSN.
  const accessCode = await exchangeNpssoForCode(NPSSO);
  const authorization = await exchangeCodeForAccessToken(accessCode);

  const titleTrophyGroups = await getTitleTrophyGroups(
    authorization,
    game,
    {
      npServiceName: await getNpServiceName(game),
      headerOverrides: {
        "Accept-Language": lang
      }
    }
  );

  return titleTrophyGroups

}


const FetchGameTrophies = async (game: string, lang: string = DEFAULT_LANGUAGE) => {

  // 1. Authenticate and become authorized with PSN.
  const accessCode = await exchangeNpssoForCode(NPSSO);
  const authorization = await exchangeCodeForAccessToken(accessCode);

  const titleTrophies = await getTitleTrophies(
    authorization,
    game,
    "all",
    {
      npServiceName: await getNpServiceName(game),
      headerOverrides: {
        "Accept-Language": lang
      }
    }
  );

  return titleTrophies;
}


export {
  FetchUserProfile,
  FetchUserGames,
  FetchUserTrophies,
  FetchGameTrophies,
  FetchGameTrophyGroups
};